/**
 * @deprecated No longer used - replaced by rembg for background removal
 * This file is kept for reference only.
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const FLAT_BG_PROMPT = `
You are EDITING this image.

TASK:

- Keep the person EXACTLY as they are: same face, hair, posture, proportions, expression, clothing.

- Remove the existing background.

- Replace it with a SINGLE, PERFECTLY FLAT BACKGROUND in RGB(0,255,0) (#00FF00).

- The entire background must be exactly this color, with NO gradients, NO textures, and NO variation.

- Do NOT add any shapes, shadows, lines, or other colors behind the person.

- Do NOT crop any part of the person.

- Return only the edited PNG.
`;

export async function avatarWithGeminiFlatBackground(inputBuffer: Buffer): Promise<Buffer> {
  const base64 = inputBuffer.toString("base64");

  const result = await ai.models.generateContent({
    // 🔁 use the IMAGE model, not gemini-2.5-flash
    model: "gemini-2.5-flash-image",
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
          { text: FLAT_BG_PROMPT },
        ],
      },
    ],
    config: {
      // 👇 tell Gemini we want image output
      responseModalities: ["IMAGE"],
      // optional but nice: force square-ish
      // imageConfig: { aspectRatio: "1:1" },
    },
  });

  const candidates = (result as any).candidates ?? [];
  const parts = candidates[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData)?.inlineData ?? null;

  if (!imagePart?.data) {
    console.error("Gemini image model did not return inlineData:", JSON.stringify(result, null, 2));
    throw new Error("Gemini did not return edited image");
  }

  return Buffer.from(imagePart.data, "base64");
}

