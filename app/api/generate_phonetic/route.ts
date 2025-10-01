// app/api/generate-phonetic/route.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text is required and must be a string" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found in env");
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    // Init Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build prompt
    const prompt = `
You are a pronunciation expert. For the given English sentence, provide BOTH:
1. IPA (International Phonetic Alphabet)
2. Readable phonetic transcription

Sentence: "${text}"

Respond ONLY as valid JSON:
{
  "phonetic": "...",
  "readablePhonetic": "..."
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedText = response.text();

    console.log("🔍 Raw Gemini output:", generatedText);

    // Remove code fences if present
    const cleanText = generatedText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Extract JSON safely
    let phoneticData: { phonetic: string; readablePhonetic: string };
    try {
      phoneticData = JSON.parse(cleanText.match(/\{[\s\S]*\}/)?.[0] || "{}");
    } catch (err) {
      console.error("❌ JSON parsing failed:", err);
      return NextResponse.json(
        {
          error: "Failed to parse AI response as JSON",
          raw: generatedText,
        },
        { status: 500 }
      );
    }

    if (!phoneticData.phonetic || !phoneticData.readablePhonetic) {
      return NextResponse.json(
        {
          error: "Incomplete phonetic data",
          raw: generatedText,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      phonetic: phoneticData.phonetic.trim(),
      readablePhonetic: phoneticData.readablePhonetic.trim(),
      success: true,
    });
  } catch (error: any) {
    console.error("❌ Gemini API Error:", error);

    return NextResponse.json(
      {
        error: "Gemini API request failed",
        details:
          process.env.NODE_ENV === "development"
            ? error.message || String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
