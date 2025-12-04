// lib/prepareAvatarForCard.ts
import sharp from "sharp";
import { removeBackgroundWithGeminiCutout } from "./removeBackgroundWithGeminiCutout";

export async function prepareAvatarForCard(inputBuffer: Buffer): Promise<Buffer> {
  // 1) Use Gemini to remove the background and get a transparent cutout
  const cutout = await removeBackgroundWithGeminiCutout(inputBuffer);

  // 2) Normalize size for card composition (no cropping, just fit inside a box)
  const size = 800; // reasonably large; composeCard will downscale as needed

  const avatar = await sharp(cutout)
    .resize(size, size, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  const meta = await sharp(avatar).metadata();
  console.log("prepareAvatarForCard meta:", meta);

  return avatar;
}

