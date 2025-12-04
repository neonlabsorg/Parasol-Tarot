// lib/enhanceCardWithGemini.ts
import { GoogleGenAI } from "@google/genai"; // same as in removeBackgroundWithGemini.ts

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

export async function enhanceCardWithGemini(cardBuffer: Buffer): Promise<Buffer> {
  if (!genAI) {
    console.warn("GEMINI_API_KEY not set – skipping Gemini enhancement");
    return cardBuffer;
  }

  const base64 = cardBuffer.toString("base64");

  const prompt = `
You are editing a tarot-style trading card image.

CONTEXT:
- The card already has the correct frame, background art and text.
- A portrait photo is composited on top, but it looks like a pasted rectangle.

HARD RULES (DO NOT BREAK):
- Keep the person's identity: do NOT change facial features, skin tone, expression, pose, or hairstyle.
- Do NOT change or move any text, font, or wording.
- Do NOT crop the card or change its aspect ratio.

WHAT YOU ARE ALLOWED TO CHANGE:
- You MAY freely repaint or adjust the green star background area.
- You MAY freely move and rescale the portrait within the green star region.
- You MAY add glow, soft shadows, gradients, and painterly blending around the portrait.

WHAT YOU MUST DO (MANDATORY):

1. PORTRAIT FIT:
   - Reposition and rescale the portrait so the head and shoulders sit naturally in the center of the green star.
   - The portrait must NOT touch the top border or the text panel.
   - Change the portrait scale by at least 20% and move it by at least 80 pixels in some direction so the composition visibly changes.

2. HALO / AURA:
   - Add a clearly visible glow / halo around the person (head and shoulders).
   - The glow should be soft and painterly, not a hard ring.
   - Use Parasol-like colors: warm cream, peach, mint, or teal.
   - The glow should blend into the green background but stay inside the dark card frame.

3. BLENDING:
   - Remove any harsh straight bottom edge of the portrait.
   - Blend the lower part of the portrait smoothly into the background using a gradient or soft brush strokes.
   - It should look like the person is part of the card art, not pasted on top.

STYLE:
- Maintain the overall flat, graphic tarot aesthetic.
- No new text, icons, or heavy textures.
- No glitch or extreme photo filters.

OUTPUT:
- Return ONE edited PNG of the entire card.
- The changes to portrait placement AND halo must be clearly visible compared to the input image.
`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: base64,
              mimeType: "image/png",
            },
          },
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "image/png",
    },
  });

  const response = result.response;
  console.log("Gemini enhanceCard raw response:", JSON.stringify(response, null, 2));

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData);
  const data = imagePart?.inlineData?.data;

  if (!data) {
    throw new Error("Gemini enhanceCard did not return an edited image (no inlineData.data)");
  }

  const enhancedBuffer = Buffer.from(data, "base64");

  const isIdentical = enhancedBuffer.equals(cardBuffer);
  console.log("Gemini enhancement identical to base card:", isIdentical);

  // If Gemini gave us the *exact* same bytes, treat it as "no change"
  if (isIdentical) {
    console.warn("Gemini returned an identical image – no visible enhancement.");
  }

  return enhancedBuffer;
}

