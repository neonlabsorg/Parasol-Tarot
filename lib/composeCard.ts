import sharp from "sharp";
import fs from "fs";
import path from "path";

const BACKGROUNDS_DIR = path.join(process.cwd(), "public", "backgrounds");

function pickBackground(username: string): string {
  const files = fs
    .readdirSync(BACKGROUNDS_DIR)
    .filter((f) => !f.startsWith(".") && !fs.statSync(path.join(BACKGROUNDS_DIR, f)).isDirectory());

  if (files.length === 0) {
    throw new Error("No backgrounds in /public/backgrounds");
  }

  const hash = [...username].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 0);
  const index = hash % files.length;
  return path.join(BACKGROUNDS_DIR, files[index]);
}

export async function composeCard(avatarBuffer: Buffer, username: string): Promise<Buffer> {
  const bgPath = pickBackground(username);
  console.log("Using background:", bgPath);

  const bg = sharp(bgPath);
  const bgMeta = await bg.metadata();
  if (!bgMeta.width || !bgMeta.height) {
    throw new Error("Cannot read background size");
  }

  const cardWidth = bgMeta.width;
  const cardHeight = bgMeta.height;

  // After avatarBuffer comes from prepareAvatarForCard
  const maxPortraitWidth = Math.round(cardWidth * 0.55);
  const maxPortraitHeight = Math.round(cardHeight * 0.55);

  const avatar = await sharp(avatarBuffer)
    .resize(maxPortraitWidth, maxPortraitHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .png()
    .toBuffer();

  const meta = await sharp(avatar).metadata();
  const avatarW = meta.width ?? maxPortraitWidth;
  const avatarH = meta.height ?? maxPortraitHeight;

  // Center a bit above the middle
  const avatarX = Math.round((cardWidth - avatarW) / 2);
  const avatarY = Math.round(cardHeight * 0.22);

  const baseCard = await bg
    .composite([
      {
        input: avatar,
        left: avatarX,
        top: avatarY,
      },
    ])
    .png()
    .toBuffer();

  return baseCard;
}

