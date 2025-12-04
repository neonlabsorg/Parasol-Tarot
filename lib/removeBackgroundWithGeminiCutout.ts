// lib/removeBackgroundWithGeminiCutout.ts
import sharp from "sharp";
import { GoogleGenAI } from "@google/genai"; // same as in enhanceCardWithGemini.ts

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenAI(apiKey) : null;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set – removeBackgroundWithGeminiCutout will just return the original image.");
}

export async function removeBackgroundWithGeminiCutout(inputBuffer: Buffer): Promise<Buffer> {
  if (!genAI) return inputBuffer;

  const base64 = inputBuffer.toString("base64");

  const prompt = `
You are editing a single portrait photo.

GOAL:
- Isolate the main person (head and shoulders) and remove the background.

RULES:
- Keep the person's face, expression, hair, and posture exactly as they are.
- Do NOT add any new background, shapes, frames, or text.
- The output must be a PNG with a transparent background (alpha channel).

WHAT TO DO:
- Remove the entire original background.
- Keep only the person (and headphones if present).
- Make sure the background pixels are fully transparent, not a solid color.
`;

  let result;
  try {
    result = await genAI.models.generateContent({
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
  } catch (err) {
    console.error("Gemini generateContent failed in removeBackgroundWithGeminiCutout:", err);
    return inputBuffer;
  }

  // IMPORTANT: handle both possible shapes: result.response or result directly
  const rawResponse: any = (result as any).response ?? result;
  console.log("Gemini cutout rawResponse keys:", Object.keys(rawResponse || {}));

  const candidates = rawResponse?.candidates;
  if (!candidates || !candidates[0]?.content?.parts) {
    console.warn("Gemini cutout: no candidates or parts – returning original image.");
    return inputBuffer;
  }

  const parts = candidates[0].content.parts;
  const imagePart = parts.find((p: any) => p.inlineData);
  const data = imagePart?.inlineData?.data;

  if (!data) {
    console.warn("Gemini cutout: no inlineData.data – returning original image.");
    return inputBuffer;
  }

  const outputBuffer = Buffer.from(data, "base64");

  const meta = await sharp(outputBuffer).metadata();
  console.log("Gemini cutout meta:", meta);

  if (!meta.hasAlpha) {
    console.warn("Gemini cutout has no alpha – returning original image.");
    return inputBuffer;
  }

  return outputBuffer;
}

