/**
 * @deprecated No longer used - replaced by rembg for background removal
 * This file is kept for reference only.
 */
import { PNG } from "pngjs";

export function chromaKeyGreenToAlpha(
  inputBuffer: Buffer,
  keyColor = { r: 0, g: 255, b: 0 },
  threshold = 80
): Buffer {
  const png = PNG.sync.read(inputBuffer);

  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];

      const dr = r - keyColor.r;
      const dg = g - keyColor.g;
      const db = b - keyColor.b;

      const distance = Math.sqrt(dr * dr + dg * dg + db * db);

      // treat anything close to #00FF00 as background
      if (distance < threshold) {
        png.data[idx + 3] = 0; // alpha = 0 → transparent
      }
    }
  }

  return PNG.sync.write(png);
}

