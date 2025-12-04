/**
 * Google Gemini API Client
 * Uses Gemini 2.5 Flash Image Preview for image editing
 * Documentation: https://ai.google.dev/gemini-api/docs/image-generation
 * 
 * CUSTOMIZE: Edit the OUTFIT_STYLES array below to match your brand's styles
 */

import { GoogleGenAI } from '@google/genai';
import { readFileSync } from 'fs';
import { join } from 'path';
import sharp from 'sharp';

// ============================================================================
// PARASOL TAROT CARD STYLES
// ============================================================================
// Each user gets assigned one tarot card archetype deterministically based on their username
const OUTFIT_STYLES = [
  {
    name: 'THE_MAGICIAN',
    description: `**THE_MAGICICAN**: Parasol Tarot Card Theme
- Background aesthetic: Mystical atmosphere with classic tarot symbols (wands, pentagrams, magical tools) in Parasol brand colors (green/teal #81B29A, coral #E07A5F, cream #F4F1DE, dark blue #3D405B, light yellow #F2CC8F)
- Classic tarot elements: Wand symbols, pentagrams, magical circles, mystical tools, arcane symbols
- Background decorative elements: Parasol spiral patterns combined with classic Magician card symbols (infinity symbol, wand, cup, sword, pentacle)
- Tarot card style: Vertical portrait format, ornate borders with mystical symbols
- Border/frame: Ornate tarot card borders with magical symbols and Parasol spiral patterns
- Background theme: Confident, powerful, mystical energy with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_HIGH_PRIESTESS',
    description: `**THE_HIGH_PRIESTESS**: Parasol Tarot Card Theme
- Background aesthetic: Serene and mysterious atmosphere with classic tarot symbols (moons, pillars, veils, pomegranates) in Parasol brand colors
- Classic tarot elements: Moon symbols, crescent moons, pillars, veil patterns, pomegranate symbols, sacred geometry
- Background decorative elements: Parasol spiral patterns combined with classic High Priestess card symbols (moon phases, pillars, sacred symbols)
- Tarot card style: Vertical portrait format, ornate borders with lunar and sacred symbols
- Border/frame: Ornate tarot card borders with moon symbols and Parasol spiral patterns
- Background theme: Wise, contemplative, esoteric knowledge with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_EMPRESS',
    description: `**THE_EMPRESS**: Parasol Tarot Card Theme
- Background aesthetic: Luxurious and nurturing atmosphere with classic tarot symbols (stars, nature elements, crown symbols) in Parasol brand colors
- Classic tarot elements: Star symbols, nature patterns, crown symbols, wheat/grain symbols, floral patterns, pentacle symbols
- Background decorative elements: Parasol spiral patterns combined with classic Empress card symbols (stars, nature, abundance symbols)
- Tarot card style: Vertical portrait format, ornate borders with nature and star symbols
- Border/frame: Ornate tarot card borders with regal symbols and Parasol spiral patterns
- Background theme: Nurturing, abundant, creative power with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_EMPEROR',
    description: `**THE_EMPEROR**: Parasol Tarot Card Theme
- Background aesthetic: Strong and commanding atmosphere with classic tarot symbols (mountains, throne symbols, ram heads, geometric patterns) in Parasol brand colors
- Classic tarot elements: Mountain symbols, throne patterns, ram head symbols, geometric structures, sword symbols, authoritative symbols
- Background decorative elements: Parasol spiral patterns combined with classic Emperor card symbols (mountains, structures, power symbols)
- Tarot card style: Vertical portrait format, ornate borders with structural and power symbols
- Border/frame: Ornate tarot card borders with authoritative symbols and Parasol spiral patterns
- Background theme: Authoritative, structured, worldly power with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_STAR',
    description: `**THE_STAR**: Parasol Tarot Card Theme
- Background aesthetic: Hopeful and inspiring atmosphere with classic tarot symbols (large star, smaller stars, water symbols, tree symbols) in Parasol brand colors
- Classic tarot elements: Large central star, multiple smaller stars, water/wave symbols, tree/nature symbols, celestial patterns
- Background decorative elements: Parasol spiral patterns combined with classic Star card symbols (stars, water, celestial elements)
- Tarot card style: Vertical portrait format, ornate borders with star and celestial symbols
- Border/frame: Ornate tarot card borders with star symbols and Parasol spiral patterns
- Background theme: Serene, hopeful, cosmic inspiration with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_MOON',
    description: `**THE_MOON**: Parasol Tarot Card Theme
- Background aesthetic: Mysterious and intuitive atmosphere with classic tarot symbols (full moon, crescent moon, towers, water, dog/wolf symbols) in Parasol brand colors
- Classic tarot elements: Full moon, crescent moon phases, tower symbols, water/wave patterns, animal symbols, path symbols
- Background decorative elements: Parasol spiral patterns combined with classic Moon card symbols (moon phases, water, mysterious elements)
- Tarot card style: Vertical portrait format, ornate borders with lunar and mystical symbols
- Border/frame: Ornate tarot card borders with moon symbols and Parasol spiral patterns
- Background theme: Intuitive, mysterious, hidden knowledge with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_SUN',
    description: `**THE_SUN**: Parasol Tarot Card Theme
- Background aesthetic: Bright and joyful atmosphere with classic tarot symbols (radiating sun, sunflowers, wall symbols, child symbols) in Parasol brand colors
- Classic tarot elements: Large radiating sun, sun rays, sunflower symbols, wall/boundary symbols, child/youth symbols, bright patterns
- Background decorative elements: Parasol spiral patterns combined with classic Sun card symbols (sun, rays, joyful elements)
- Tarot card style: Vertical portrait format, ornate borders with solar and radiant symbols
- Border/frame: Ornate tarot card borders with sun symbols and Parasol spiral patterns
- Background theme: Joyful, radiant, life energy with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
  {
    name: 'THE_WORLD',
    description: `**THE_WORLD**: Parasol Tarot Card Theme
- Background aesthetic: Complete and fulfilled atmosphere with classic tarot symbols (wreath, four elements symbols, world symbols) in Parasol brand colors
- Classic tarot elements: Wreath/circle symbols, four element symbols (earth, air, fire, water), world/globe symbols, completion symbols
- Background decorative elements: Parasol spiral patterns combined with classic World card symbols (wreath, elements, unity symbols)
- Tarot card style: Vertical portrait format, ornate borders with universal and completion symbols
- Border/frame: Ornate tarot card borders with world symbols and Parasol spiral patterns
- Background theme: Complete, fulfilled, universal wisdom with classic tarot card imagery
- Use only Parasol brand colors for all tarot symbols and decorative elements`,
  },
];

// ============================================================================
// PARASOL BRAND COLORS
// ============================================================================
// Color combinations:
// 1. #81B29A (green/teal) with #E07A5F (coral) and #F4F1DE (cream)
// 2. #81B29A (green/teal) with #3D405B (dark blue) and #F4F1DE (cream) and #F2CC8F (light yellow)
const BRAND_COLORS = {
  primary: '#81B29A',      // Parasol primary - green/teal (base color for both combinations)
  secondary: '#F4F1DE',    // Parasol secondary - cream/beige (common to both combinations)
  accent: '#3D405B',       // Parasol accent - dark blue/navy (from combination 2)
  highlight: '#E07A5F',    // Parasol highlight - coral/salmon (from combination 1)
  light: '#F2CC8F',        // Parasol light - light yellow/cream (from combination 2)
};

// ============================================================================
// PARASOL TAROT PROMPT
// ============================================================================
export const PARASOL_TAROT_PROMPT = `
You are editing a user's TWITTER AVATAR into a Parasol-branded tarot card.

INPUT:
- One image: the user's Twitter avatar.

OVERALL GOAL:
- Transform the avatar into a Parasol tarot card.
- The person must remain recognizably the same as in the original photo.
- Keep the person at a natural size - do NOT zoom in too much on the face.
- Show the person's head, shoulders, and upper body with comfortable spacing around them.
- Generate ONLY the person themselves - do NOT add any frames, borders, ornaments, decorative elements, or effects.
- Do NOT generate or modify any background - the background will be provided separately and must remain completely unchanged.

HARD CONSTRAINTS ON THE PERSON (DO NOT BREAK):
1. Do NOT redraw the face.
   - Keep the original facial features, proportions, skin, and expression.
   - Do not replace the face with an illustration or new rendering.
   - Do not change age, gender, or identity.

2. Do NOT change the head or body posture.
   - Keep the same pose, head angle, and shoulder position as in the avatar.
   - Do not turn the head, tilt it differently, or change the body orientation.

3. Do NOT zoom in, crop, or resize the person.
   - Keep the EXACT same framing and composition as the input avatar.
   - Do NOT crop tighter or zoom in on the face.
   - Do NOT make the person larger or smaller - keep them at the EXACT same size relative to the frame.
   - Maintain the same distance from the camera - if the input shows head and shoulders, keep it exactly that way.
   - If the input shows more of the body, keep that framing.
   - Do NOT change the zoom level, crop the image, or resize the person in any way.
   - The person should appear at the same size and scale as in the input image.

4. Clothing:
   - Keep the same garments and general shape.
   - You may slightly adjust colors/lighting to better match the card, but do not turn a shirt into a robe, armor, etc.

5. You may apply gentle global color grading to the entire image, but the person must still look like a natural photo of the same person, not a cartoon or heavily stylized illustration.

CRITICAL - GENERATE ONLY THE PERSON, NO DECORATIVE ELEMENTS:
- Your output MUST have a TRANSPARENT background or a single solid color that can be easily removed.
- Generate ONLY the person themselves - do NOT add any frames, borders, ornaments, decorative elements, patterns, symbols, text, or visual effects.
- Do NOT add any card frames, borders, or decorative elements around the person.
- Do NOT add any corner ornaments, pinwheels, spirals, or decorative patterns anywhere.
- Do NOT add any light rays, halos, glows, particles, or effects around the person.
- Do NOT add any text, titles, or symbols anywhere in the image.
- Do NOT generate, create, paint, or draw any background scene, pattern, texture, or image.
- Do NOT add any background colors, gradients, or images behind the person.
- The background area must be completely empty and transparent - generate ONLY the person, nothing else.
- The background will be added programmatically from a separate image file that must remain completely unchanged.
- Your job is ONLY to generate the person themselves on a transparent background - no decorative elements of any kind.

WHAT YOU MAY DO:
- Generate ONLY the person themselves - keep them looking natural and recognizable.
- You may apply gentle color grading to the person to match the aesthetic, but keep it minimal.
- The person should be centered in the image.
- Everything else (background, frames, borders, ornaments, effects, text) will be handled separately - do NOT add any of these.

PARASOL BRAND COLOR PALETTE (USE THESE AS PRIMARY COLORS):
- Primary mint/teal: #81B29A (main green-teal, use for backgrounds, spirals, and primary decorative elements)
- Secondary cream: #F4F1DE (soft off-white/parchment, use for subtle details and card base)
- Dark navy/ink: #3D405B (use for borders, text, and strong accents)
- Light yellow/cream: #F2CC8F (use for glows, halos, and warm highlights)
- Coral accent: #E07A5F (use sparingly for small accent details only)

These colors are provided for reference only - you should NOT be using them to create backgrounds, frames, ornaments, or glows.
You are generating ONLY the person - no decorative elements should use these colors.

PARASOL STYLE GUIDELINES:
- Portrait orientation.
- Generate ONLY the person - do NOT add any decorative patterns, spirals, motifs, ornaments, borders, frames, glows, halos, particles, text, or design elements of any kind.
- Do NOT add any visual effects, light rays, or decorative elements anywhere.
- The background area must be completely empty and transparent.
- All decorative elements, frames, borders, ornaments, and text will be part of the separate background image - do NOT generate any of these.

COMPOSITION:
- Keep the EXACT same framing, composition, and size as the input avatar image.
- Do NOT zoom in, crop, resize, or change the framing in any way.
- Do NOT make the person larger - keep them at the EXACT same size relative to the frame as in the input.
- Maintain the same distance from the camera as the input - if the input shows head and shoulders, keep it exactly that way.
- Do NOT crop tighter or zoom in on the face - preserve the original zoom level and size.
- Keep the person in the same position and at the same scale as in the input image.
- The person should occupy the same amount of space in the frame as they do in the input image.
- The background area must be completely empty, transparent, and untouched - NO stylization, NO additions, NO modifications, NO elements of any kind.
- Do NOT add any effects, frames, borders, ornaments, or decorative elements - generate ONLY the person.
- The background will be a separate image that must remain completely unchanged - your output should have an empty/transparent background with ONLY the person, nothing else.

OUTPUT REQUIREMENTS:
- A single high-quality image with ONLY the person - no frames, no borders, no ornaments, no decorative elements, no effects, no text, nothing else.
- The person should be immediately recognizable as the same individual from the input avatar.
- The background area must be completely transparent or a single removable color - NO elements, NO ornaments, NO overlays, NO decorations, NO frames, NO borders, NO text, NO effects of any kind.
- Generate ONLY the person themselves on a transparent background - that's it.
- The background will be provided separately and must remain completely unchanged - your output should be just the person on a transparent background.
`;

// ============================================================================
// Style Assignment Logic (Deterministic)
// ============================================================================
/**
 * Assigns a style to a user based on their username hash
 * Same username always gets the same style
 */
function getUserStyle(username: string): typeof OUTFIT_STYLES[0] {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    const char = username.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const styleIndex = Math.abs(hash) % OUTFIT_STYLES.length;
  const selectedStyle = OUTFIT_STYLES[styleIndex];
  
  console.log(`[STYLE] User "${username}" assigned style: ${selectedStyle.name} (index: ${styleIndex})`);
  
  return selectedStyle;
}

/**
 * Generate an outfit image from an avatar URL
 * @param avatarUrl - URL of the user's avatar image
 * @param username - Twitter username (used for deterministic style selection)
 * @param brandName - Optional brand/event name for the prompt
 */
export async function generateOutfitImage(
  avatarUrl: string,
  username?: string,
  brandName: string = 'your event'
): Promise<string | null> {
  try {
    // STEP 1: Load the input PNG (with transparency) directly using sharp
    let inputImageBuffer: Buffer;
    
    if (avatarUrl.startsWith('data:')) {
      // Extract base64 data from data URL
      const matches = avatarUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 data URL format');
      }
      inputImageBuffer = Buffer.from(matches[2], 'base64');
    } else {
      // Fetch the image from the URL
      const imageResponse = await fetch(avatarUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch avatar image');
      }
      const imageArrayBuffer = await imageResponse.arrayBuffer();
      inputImageBuffer = Buffer.from(imageArrayBuffer);
    }
    
    console.log(`[Image Processing] STEP 1: Loaded input image: ${inputImageBuffer.length} bytes`);
    
    // Get input image dimensions
    const inputMetadata = await sharp(inputImageBuffer).metadata();
    const inputWidth = inputMetadata.width || 1024;
    const inputHeight = inputMetadata.height || 1024;
    console.log(`[Image Processing] Input image dimensions: ${inputWidth}x${inputHeight}`);
    
    // STEP 2: Load a background file from /public/backgrounds/*
    // Random or selected (deterministic based on username)
    const backgroundImageNames = [
      'background-01',
      'background-02',
      'background-03',
      'background-04',
      'background-05',
    ];
    
    let backgroundBuffer: Buffer | null = null;
    let backgroundPath: string | null = null;
    
    // Select background deterministically based on username (or use first one)
    const bgIndex = username && backgroundImageNames.length > 0
      ? (username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % backgroundImageNames.length)
      : 0;
    
    // Try to load the selected background (PNG first, then JPG)
    const extensions = ['.png', '.jpg', '.jpeg'];
    for (const ext of extensions) {
      const imageName = `backgrounds/${backgroundImageNames[bgIndex]}${ext}`;
      try {
        backgroundPath = join(process.cwd(), 'public', imageName);
        console.log(`[Image Processing] STEP 2: Attempting to load background: ${backgroundPath}`);
        backgroundBuffer = readFileSync(backgroundPath);
        console.log(`[Image Processing] ✓ Loaded background: ${imageName} (${backgroundBuffer.length} bytes)`);
        break;
      } catch (error) {
        // Continue to next extension
      }
    }
    
    if (!backgroundBuffer) {
      console.error('[Image Processing] ERROR: Could not load background image from /public/backgrounds/');
      throw new Error('Background image not found in /public/backgrounds/');
    }
    
    // STEP 3: Resize background to match input image dimensions
    const resizedBackground = await sharp(backgroundBuffer)
      .resize(inputWidth, inputHeight, { fit: 'cover' })
      .toBuffer();
    
    console.log(`[Image Processing] STEP 3: Resized background to match input: ${inputWidth}x${inputHeight}`);
    
    // STEP 4: Composite input image ON TOP of the background using sharp().composite()
    // Transparent pixels in input will reveal background beneath
    console.log(`[Image Processing] STEP 4: Compositing input image on top of background`);
    const compositedBuffer = await sharp(resizedBackground)
      .composite([
        {
          input: inputImageBuffer, // Layer 2: Input image (with transparency) on top
        },
      ])
      .removeAlpha() // STEP 5: Return fully opaque output (no transparency)
      .toBuffer();
    
    console.log(`[Image Processing] STEP 5: Final composited image (fully opaque): ${compositedBuffer.length} bytes`);
    
    // Convert to base64 and return
    const compositedBase64 = compositedBuffer.toString('base64');
    return compositedBase64;

  } catch (error) {
    console.error('[Image Processing] Error processing image:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Failed to fetch the image. Please check the image URL or try uploading an image instead.');
      }
      if (error.message.includes('Invalid base64')) {
        throw new Error('Invalid image format. Please try uploading a different image.');
      }
      if (error.message.includes('Background image not found')) {
        throw new Error('Background image not found. Please ensure background images exist in /public/backgrounds/ folder.');
      }
      throw new Error(`Image processing failed: ${error.message}`);
    }
    
    throw error;
  }
}

/**
 * Get the style name assigned to a username (for display purposes)
 */
export function getAssignedStyleName(username: string): string {
  const style = getUserStyle(username);
  return style.name;
}
