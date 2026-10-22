// app/api/generate-quiz/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, difficulty, numQuestions } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Topic is required and must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!['easy', 'medium', 'advanced'].includes(difficulty)) {
      return NextResponse.json(
        { error: 'Difficulty must be easy, medium, or advanced' },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(numQuestions) || 10, 5), 15);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not set in environment variables' },
        { status: 500 }
      );
    }

    const difficultyGuide: Record<string, string> = {
      easy: 'basic recall, simple facts, beginner-friendly',
      medium: 'moderate understanding, some analysis, intermediate level',
      advanced: 'deep understanding, critical thinking, expert-level nuance',
    };

    const prompt = `You are a quiz master. Generate ${count} multiple-choice quiz questions about: "${topic.trim()}"

Difficulty: ${difficulty} (${difficultyGuide[difficulty]})

Requirements:
- Each question must have exactly 4 answer options
- Only ONE option is correct
- Distractors should be plausible but clearly wrong to someone who knows the topic
- Questions should be varied (definitions, examples, comparisons, applications)
- Avoid trick questions or ambiguity

IMPORTANT: Respond ONLY with a valid JSON array. No markdown, no backticks, no explanation before or after.

Each element must follow this exact shape:
{
  "question": "The question text here?",
  "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
  "answer": "The exact text of the correct option (must match one of the options exactly)"
}

Example output:
[
  {
    "question": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "answer": "Paris"
  }
]

Now generate ${count} questions about: ${topic.trim()}`;

    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Quiz Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!openRouterRes.ok) {
      const errorBody = await openRouterRes.text();
      console.error('OpenRouter error:', openRouterRes.status, errorBody);
      return NextResponse.json(
        { error: `OpenRouter API returned ${openRouterRes.status}. Check your API key and quota.` },
        { status: 502 }
      );
    }

    const result = await openRouterRes.json();
    const generatedText = result.choices?.[0]?.message?.content;

    if (!generatedText) {
      return NextResponse.json(
        { error: 'No content returned from the AI model' },
        { status: 502 }
      );
    }

    // Strip markdown fences if present, then extract JSON array
    const cleaned = generatedText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON array found in AI response:', generatedText);
      return NextResponse.json(
        { error: 'AI did not return a valid JSON array. Please try again.' },
        { status: 502 }
      );
    }

    let quizData: Array<{ question: string; options: string[]; answer: string }> = [];
    try {
      quizData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 502 }
      );
    }

    // Validate each question strictly
    const validated = quizData
      .filter(
        (q) =>
          q &&
          typeof q.question === 'string' &&
          q.question.trim().length > 0 &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          q.options.every((o) => typeof o === 'string') &&
          typeof q.answer === 'string' &&
          q.options.includes(q.answer)
      )
      .slice(0, count);

    if (validated.length < 3) {
      return NextResponse.json(
        { error: `Only ${validated.length} valid questions were generated. Please try a different topic or try again.` },
        { status: 502 }
      );
    }

    return NextResponse.json({
      questions: validated,
      topic: topic.trim(),
      difficulty,
      numQuestions: validated.length,
      success: true,
    });

  } catch (error: any) {
    console.error('Quiz generation unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}