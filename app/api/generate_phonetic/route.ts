// app/api/generate-phonetic/route.ts
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

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key is not configured" },
        { status: 500 }
      );
    }

    // Stricter prompt — no JSON schema ambiguity
    const prompt = `You are a pronunciation expert. Given the English sentence below, return ONLY a raw JSON object with exactly two keys: "phonetic" (IPA transcription) and "readablePhonetic" (easy syllable-by-syllable guide for non-linguists).

Do NOT include markdown, code fences, backticks, or any explanation. Output raw JSON only.

Sentence: ${text}

Output format (raw JSON, nothing else):
{"phonetic":"...","readablePhonetic":"..."}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Phonetic Generator",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter error:", response.status, errorBody);
      throw new Error(`OpenRouter API error: ${response.status} — ${errorBody}`);
    }

    const result = await response.json();
    console.log("OpenRouter raw result:", JSON.stringify(result, null, 2));

    const generatedText = result.choices?.[0]?.message?.content;
    console.log("Generated text:", generatedText);

    if (!generatedText) {
      throw new Error("No content returned from OpenRouter");
    }

    // Strip any accidental markdown fences
    const cleanText = generatedText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    console.log("Clean text to parse:", cleanText);

    // Extract the first JSON object found
    const jsonMatch = cleanText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("No JSON object found in response:", cleanText);
      return NextResponse.json(
        { error: "AI did not return a JSON object", raw: generatedText },
        { status: 500 }
      );
    }

    let phoneticData: { phonetic?: string; readablePhonetic?: string };
    try {
      phoneticData = JSON.parse(jsonMatch[0]);
      console.log("Parsed phonetic data:", phoneticData);
    } catch (err) {
      console.error("JSON parse error:", err, "Raw match:", jsonMatch[0]);
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON", raw: generatedText },
        { status: 500 }
      );
    }

    if (!phoneticData.phonetic || !phoneticData.readablePhonetic) {
      console.error("Missing fields in phonetic data:", phoneticData);
      return NextResponse.json(
        { error: "AI returned JSON but fields are missing", raw: generatedText, parsed: phoneticData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      phonetic: phoneticData.phonetic.trim(),
      readablePhonetic: phoneticData.readablePhonetic.trim(),
      success: true,
    });

  } catch (error: any) {
    console.error("generate-phonetic error:", error);

    let errorMessage = "Failed to generate phonetics";
    if (error.message?.includes("401")) errorMessage = "Invalid OpenRouter API key";
    else if (error.message?.includes("429") || error.message?.includes("quota")) errorMessage = "API quota exceeded, please try again later";
    else if (error.message?.includes("network") || error.message?.includes("fetch")) errorMessage = "Network error, please check your connection";

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}