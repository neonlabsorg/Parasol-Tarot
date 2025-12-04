import { NextRequest, NextResponse } from "next/server";
import { prepareAvatarForCard } from "@/lib/prepareAvatarForCard";
import { composeCard } from "@/lib/composeCard";
import { enhanceCardWithGemini } from "@/lib/enhanceCardWithGemini";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const username = (formData.get("username") as string) || "default";

    if (!file) {
      return new NextResponse("Missing image file", { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const avatarBuffer = await prepareAvatarForCard(inputBuffer);
    const cardBuffer = await composeCard(avatarBuffer, username);

    let finalBuffer: Buffer;
    try {
      console.log("Calling enhanceCardWithGemini...");
      finalBuffer = await enhanceCardWithGemini(cardBuffer);
      console.log("Enhanced card size:", finalBuffer.length, "original size:", cardBuffer.length);
    } catch (err) {
      console.error("Gemini enhancement failed, using base card:", err);
      finalBuffer = cardBuffer;
    }

    return new NextResponse(finalBuffer, {
      status: 200,
      headers: { "Content-Type": "image/png" },
    });
  } catch (err: any) {
    console.error("process-image error:", err);
    return new NextResponse(
      `Image processing error: ${err?.message || "Unknown error"}`,
      { status: 500 }
    );
  }
}

