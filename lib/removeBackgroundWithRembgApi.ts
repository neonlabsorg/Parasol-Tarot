// lib/removeBackgroundWithRembgApi.ts
import { rembg } from "@remove-background-ai/rembg.js";
import { readFileSync } from "fs";

export async function removeBackgroundWithRembgApi(inputBuffer: Buffer): Promise<Buffer> {
  const apiKey = process.env.REMBG_API_KEY;
  if (!apiKey) {
    throw new Error("REMBG_API_KEY is not set in environment");
  }

  try {
    const result = await rembg({
      apiKey,
      inputImage: inputBuffer,
      options: {
        format: "png",
        returnBase64: false,
      },
      onUploadProgress: () => {},       // required by API
      onDownloadProgress: () => {},      // required by API
    });

    // Check for outputImageBuffer (direct buffer return)
    const { outputImageBuffer } = result as any;
    if (outputImageBuffer instanceof Buffer) {
      return outputImageBuffer;
    }
    if (outputImageBuffer?.buffer) {
      return Buffer.from(outputImageBuffer.buffer);
    }

    // When returnBase64: false, result is { outputImagePath: string, cleanup: () => Promise<void> }
    if (result.outputImagePath) {
      const outputBuffer = readFileSync(result.outputImagePath);
      // Clean up the temporary file
      await result.cleanup();
      return outputBuffer;
    }

    // When returnBase64: true, result is { base64Image: string }
    if (result.base64Image) {
      const base64Data = result.base64Image.replace(/^data:image\/\w+;base64,/, "");
      return Buffer.from(base64Data, "base64");
    }

    console.error("Unexpected rembg API response:", JSON.stringify(result, null, 2));
    throw new Error("rembg.js did not return an output buffer");
  } catch (error: any) {
    console.error("[removeBackgroundWithRembgApi] Error:", error);
    if (error.response) {
      console.error("[removeBackgroundWithRembgApi] Response status:", error.response.status);
      console.error("[removeBackgroundWithRembgApi] Response body:", error.response.data || error.response.body);
      throw new Error(`rembg API failed: ${error.response.status} - ${JSON.stringify(error.response.data || error.response.body)}`);
    }
    if (error.message) {
      throw new Error(`rembg API error: ${error.message}`);
    }
    throw error;
  }
}

