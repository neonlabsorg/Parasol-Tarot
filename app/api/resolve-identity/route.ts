import { NextRequest, NextResponse } from 'next/server';

/**
 * Resolve Twitter identity and fetch avatar
 * Uses Unavatar.io service (no Twitter API required)
 */
const AVATAR_SERVICES = [
  {
    name: 'Unavatar (X)',
    url: (handle: string) => `https://unavatar.io/x/${handle}`,
  },
  {
    name: 'Unavatar (Twitter)',
    url: (handle: string) => `https://unavatar.io/twitter/${handle}`,
  },
];

async function fetchAvatarWithFallback(handle: string): Promise<string | null> {
  console.log(`[DEBUG] Starting avatar fetch for: ${handle}`);
  
  for (const service of AVATAR_SERVICES) {
    const url = service.url(handle);
    console.log(`[DEBUG] Trying ${service.name}: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(5000), // 5 second timeout per service
      });
      
      console.log(`[DEBUG] ${service.name} response: ${response.status}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength) : 0;
        
        console.log(`[DEBUG] Content-Type: ${contentType}, Length: ${size}`);
        
        // Check if it's an actual image (not HTML)
        if (contentType?.includes('image')) {
          // Unavatar's default placeholder is exactly 1506 bytes
          // Reject it and try next service
          if (size === 1506) {
            console.log(`[WARN] ${service.name} returned default placeholder (1506 bytes)`);
            continue;
          }
          
          console.log(`[SUCCESS] Valid avatar found via ${service.name}: ${url}`);
          return url;
        } else {
          console.log(`[WARN] ${service.name} returned non-image content: ${contentType}`);
        }
      }
    } catch (error) {
      console.error(`[ERROR] ${service.name} failed:`, error);
    }
  }
  
  console.error(`[ERROR] All avatar services failed for ${handle}`);
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle, platform } = body;

    // Validate input
    if (!handle || typeof handle !== 'string') {
      return NextResponse.json(
        { error: 'Handle is required' },
        { status: 400 }
      );
    }

    if (platform !== 'twitter') {
      return NextResponse.json(
        { error: 'Only Twitter is supported' },
        { status: 400 }
      );
    }

    // Clean the handle (remove @ if present)
    const cleanHandle = handle.replace(/^@/, '').trim();

    // Try multiple avatar services with fallback
    const imageUrl = await fetchAvatarWithFallback(cleanHandle);
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Profile not found or avatar unavailable. The account might be private, suspended, or the handle is incorrect.' },
        { status: 404 }
      );
    }
    
    console.log(`[API] Successfully resolved avatar for ${cleanHandle}: ${imageUrl}`);

    // Return the profile data
    return NextResponse.json({
      success: true,
      profile: {
        id: cleanHandle,
        displayName: cleanHandle,
        name: cleanHandle,
        imageUrl: imageUrl,
      },
    });
  } catch (error) {
    console.error('Error in resolve-identity:', error);
    return NextResponse.json(
      { error: 'Failed to resolve identity' },
      { status: 500 }
    );
  }
}

