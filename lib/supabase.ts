/**
 * Supabase Client Configuration
 * Database for storing generated outfit images and caching results
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing environment variables. Database features will be disabled.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Database types
export interface OutfitRecord {
  id: string;
  handle: string;
  platform: string;
  style: string;
  original_image_url: string | null;
  generated_image_base64: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get cached outfit for a handle
 */
export async function getCachedOutfit(handle: string): Promise<OutfitRecord | null> {
  if (!supabase) {
    console.warn('[Supabase] Client not initialized');
    return null;
  }

  const normalizedHandle = handle.toLowerCase();
  console.log(`[Supabase] Looking for cached outfit for: ${normalizedHandle}`);

  try {
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .eq('handle', normalizedHandle)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { 
        console.log(`[Supabase] No cached outfit found for: ${normalizedHandle}`);
      } else {
        console.error('[Supabase] Error fetching cached outfit:', error);
      }
      return null;
    }

    console.log(`[Supabase] ✅ Found cached outfit for: ${normalizedHandle}`);
    return data as OutfitRecord;
  } catch (error) {
    console.error('[Supabase] Exception fetching cached outfit:', error);
    return null;
  }
}

/**
 * Save generated outfit to database
 */
export async function saveOutfit(data: {
  handle: string;
  platform: string;
  style: string;
  originalImageUrl: string | null;
  generatedImageBase64: string;
}): Promise<boolean> {
  if (!supabase) {
    console.warn('[Supabase] Client not initialized, cannot save outfit');
    return false;
  }

  const normalizedHandle = data.handle.toLowerCase();
  console.log(`[Supabase] Attempting to save outfit for: ${normalizedHandle}`);

  try {
    const { error } = await supabase
      .from('outfits')
      .upsert({
        handle: normalizedHandle,
        platform: data.platform,
        style: data.style,
        original_image_url: data.originalImageUrl,
        generated_image_base64: data.generatedImageBase64,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'handle',
      });

    if (error) {
      console.error('[Supabase] ❌ Error saving outfit:', error);
      return false;
    }

    console.log(`[Supabase] ✅ Successfully saved outfit for ${normalizedHandle} with style: ${data.style}`);
    return true;
  } catch (error) {
    console.error('[Supabase] ❌ Exception saving outfit:', error);
    return false;
  }
}

/**
 * Get all outfits for gallery (paginated)
 */
export async function getAllOutfits(limit = 50, offset = 0): Promise<OutfitRecord[]> {
  if (!supabase) {
    console.error('[Supabase] Client not initialized - cannot fetch outfits');
    return [];
  }

  try {
    // Fetch with a smaller limit to avoid timeout (max 6 at a time due to large base64 images)
    const actualLimit = Math.min(limit, 6);
    
    const { data, error } = await supabase
      .from('outfits')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + actualLimit - 1);

    if (error) {
      console.error('[Supabase] Error fetching outfits:', error);
      return [];
    }

    return (data as OutfitRecord[]) || [];
  } catch (error) {
    console.error('[Supabase] Exception fetching outfits:', error);
    return [];
  }
}

