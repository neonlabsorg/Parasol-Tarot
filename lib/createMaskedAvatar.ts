/**
 * @deprecated No longer used - replaced by rembg for background removal
 * This file is kept for reference only.
 */
import sharp from "sharp";

export async function createMaskedAvatar(inputBuffer: Buffer): Promise<Buffer> {
  // Resize avatar to a manageable square
  const size = 600; // you can tweak this
  const resized = await sharp(inputBuffer)
    .resize(size, size, {
      fit: "cover", // center-crop to square
      position: "centre",
    })
    .toBuffer();

  // Create a circular mask as SVG
  const radius = size / 2;
  const svg = `
    <svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="white" />
    </svg>
  `;
  const mask = Buffer.from(svg);

  // Apply mask: keep only pixels inside the circle
  const masked = await sharp(resized)
    .composite([
      {
        input: mask,
        blend: "dest-in", // use SVG as alpha mask
      },
    ])
    .png()
    .toBuffer();

  return masked;
}

