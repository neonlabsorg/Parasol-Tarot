import { NextRequest } from 'next/server';
import { getCachedOutfit } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const handle = searchParams.get('handle');

    if (!handle) {
      return new Response('Handle parameter required', { status: 400 });
    }

    // Get outfit from database
    const outfit = await getCachedOutfit(handle);

    if (!outfit || !outfit.generated_image_base64) {
      return new Response('Outfit not found', { status: 404 });
    }

    // Return the generated outfit image
    const imageBuffer = Buffer.from(outfit.generated_image_base64, 'base64');
    
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

