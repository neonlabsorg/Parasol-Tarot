/**
 * @deprecated No longer used - replaced by rembg for background removal
 * This file is kept for reference only.
 */
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function removeBackgroundWithGemini(inputBuffer: Buffer): Promise<Buffer> {
  const base64 = inputBuffer.toString("base64");

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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
          {
            text: `
You are EDITING this image.

GOAL:
Return the SAME person, but with the ORIGINAL background removed.

- Keep face, hair, expression, posture, proportions, clothing EXACTLY the same.
- Remove the background completely.
- All pixels outside the person must be fully transparent (alpha = 0).
- Do NOT draw checkerboards or patterns. Do NOT fill with any color.
- Output a PNG with transparency around the person.
            `,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "image/png",
    },
  });

  const candidates = (result as any).candidates ?? [];
  const parts = candidates[0]?.content?.parts ?? [];
  const imagePart = parts.find((p: any) => p.inlineData)?.inlineData ?? null;

  if (!imagePart?.data) {
    console.error("Gemini background removal: no inlineData", JSON.stringify(result, null, 2));
    throw new Error("Gemini did not return an edited image");
  }

  // ❗️Important: do NOT fallback here, just return what Gemini gave us
  const editedBuffer = Buffer.from(imagePart.data, "base64");
  return editedBuffer;
}


