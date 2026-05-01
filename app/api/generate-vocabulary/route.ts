// app/api/generate-vocabulary/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { topic, count } = await request.json();

  if (!topic || !count) {
    return NextResponse.json({ error: 'Topic and count are required' }, { status: 400 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  const prompt = `Generate exactly ${count} English vocabulary words about "${topic}".

Return ONLY a valid JSON array. No markdown, no explanation, no backticks.

Each object must have:
- "word": the English word (string)
- "phonetic": IPA pronunciation with slashes e.g. /ˈwɔːtər/ (string)
- "example": a simple example sentence using the word (string)
- "image": a single relevant emoji (string)

Example format:
[{"word":"apple","phonetic":"/ˈæpəl/","example":"I eat an apple every morning.","image":"🍎"}]

Topic: ${topic}
Count: ${count}`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Vocabulary Builder',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenRouter error:', err);
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';

    // Strip markdown fences if present
    const clean = raw.replace(/```json\n?|\n?```/g, '').trim();

    let words;
    try {
      words = JSON.parse(clean);
    } catch {
      console.error('Failed to parse AI response:', clean);
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    if (!Array.isArray(words)) {
      return NextResponse.json({ error: 'Invalid response format' }, { status: 500 });
    }

    // Sanitize: ensure required fields exist
    const sanitized = words
      .filter((w: any) => w.word && w.image && w.example)
      .map((w: any) => ({
        word: String(w.word),
        phonetic: String(w.phonetic || `/${w.word}/`),
        example: String(w.example),
        image: String(w.image),
      }));

    return NextResponse.json({ words: sanitized });
  } catch (error) {
    console.error('Vocabulary generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}