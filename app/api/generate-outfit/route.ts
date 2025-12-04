import { NextRequest, NextResponse } from 'next/server';
import { getAssignedStyleName } from '@/lib/gemini-api';
import { getCachedOutfit, saveOutfit } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, username, forceRegenerate } = body;

    console.log(`[API] Generate outfit request - username: ${username}, imageUrl: ${imageUrl}`);

    // Check cache first (unless force regenerate)
    if (username && !forceRegenerate) {
      const cached = await getCachedOutfit(username);
      if (cached) {
        console.log(`[API] ✅ Returning cached outfit for ${username}`);
        return NextResponse.json({
          success: true,
          image: cached.generated_image_base64,
          style: cached.style,
          cached: true,
        });
      }
      console.log(`[API] No cached outfit found for ${username}`);
    }

    // If imageUrl is 'cached', it means frontend is just checking cache
    // Return 404 to signal no cache exists
    if (imageUrl === 'cached') {
      console.log(`[API] Cache-only request for ${username} - no cache found`);
      return NextResponse.json(
        { error: 'No cached outfit found', cached: false },
        { status: 404 }
      );
    }

    // Validate input for new generation
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format (or allow base64 data URLs)
    if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Invalid image URL format' },
        { status: 400 }
      );
    }

    console.log(`[API] Processing image for user: ${username || 'unknown'}`);

    // Convert imageUrl to a buffer for process-image endpoint
    let imageBuffer: Buffer;
    
    if (imageUrl.startsWith('data:')) {
      // Extract base64 data from data URL
      const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { error: 'Invalid base64 data URL format' },
          { status: 400 }
        );
      }
      const base64Data = matches[2];
      imageBuffer = Buffer.from(base64Data, 'base64');
    } else {
      // Fetch the image from URL
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        return NextResponse.json(
          { error: 'Failed to fetch image from URL' },
          { status: 400 }
        );
      }
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      imageBuffer = Buffer.from(imageArrayBuffer);
    }

    // Call the process-image endpoint (Sharp-based, no Gemini)
    const formData = new FormData();
    // Create a Blob from the buffer for FormData
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    formData.append('image', imageBlob, 'image.png');
    formData.append('username', username || 'default');

    // Get the origin from the request URL
    const origin = request.nextUrl.origin;
    const processResponse = await fetch(`${origin}/api/process-image`, {
      method: 'POST',
      body: formData,
    });

    if (!processResponse.ok) {
      const errorText = await processResponse.text();
      console.error('[API] process-image failed:', errorText);
      return NextResponse.json(
        { error: `Failed to process image: ${errorText}` },
        { status: processResponse.status }
      );
    }

    // Convert the PNG response to base64
    const outputBuffer = await processResponse.arrayBuffer();
    const generatedImageBase64 = Buffer.from(outputBuffer).toString('base64');

    // Save to database for caching
    if (username) {
      // Get the style that was assigned to this user
      const style = getAssignedStyleName(username);
      const saved = await saveOutfit({
        handle: username,
        platform: 'twitter',
        style,
        originalImageUrl: imageUrl.startsWith('http') ? imageUrl : null,
        generatedImageBase64,
      });
      
      if (saved) {
        console.log(`[API] Successfully saved outfit for ${username}`);
      } else {
        console.error(`[API] Failed to save outfit for ${username}`);
      }
    }

    // Return the generated image as base64
    return NextResponse.json({
      success: true,
      image: generatedImageBase64,
      cached: false,
    });
  } catch (error) {
    console.error('Error in generate-outfit:', error);
    
    // Provide more specific error messages
    let errorMessage = 'We couldn\'t generate your outfit, please try again';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
      });
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Increase the timeout for this API route (Vercel default is 10s)
export const maxDuration = 60; // 60 seconds

