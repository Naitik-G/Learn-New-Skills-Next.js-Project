// app/api/generate-conversation/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { topic, participants } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    if (!participants || (participants !== 2 && participants !== 3)) {
      return NextResponse.json(
        { error: 'Participants must be 2 or 3' },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key is not configured' },
        { status: 500 }
      );
    }

    const participantNames = participants === 2
      ? ['Alex', 'Jordan']
      : ['Alex', 'Jordan', 'Casey'];

    const prompt = `You are a skilled conversation writer. Create a realistic, engaging conversation between ${participants} people discussing the following topic: "${topic}"

Requirements:
- ${participants} participants named: ${participantNames.join(', ')}
- Each person should have a distinct voice and perspective
- The conversation should be natural and educational
- Include 8-12 exchanges (back and forth dialogue)
- Each line should be substantial (2-3 sentences)
- Cover different aspects of the topic
- Make it engaging and informative
- Use natural speech patterns and transitions

IMPORTANT: Respond ONLY with a valid JSON array, no markdown, no backticks, no preamble.
Each element is a string starting with the speaker's name and a colon.

Example:
["Alex: I think this topic is really fascinating because...", "Jordan: That's an interesting point, Alex. I've always wondered about..."]

Topic: ${topic}
Participant names: ${participantNames.join(', ')}`;

    // OpenRouter uses OpenAI-compatible API
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Conversation Generator',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',   // OpenRouter model ID for Gemini Flash
        max_tokens: 2000,
        messages: [
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenRouter error:', response.status, errorBody);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedText = result.choices?.[0]?.message?.content;

    if (!generatedText) {
      throw new Error('No content returned from OpenRouter');
    }

    // Parse JSON from response
    let conversationData;
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      try {
        conversationData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      // Fallback: split by newlines and filter lines with speaker names
      const lines = generatedText
        .split('\n')
        .filter((line: string) => line.trim() && line.includes(':'))
        .map((line: string) => line.trim())
        .slice(0, 12);

      conversationData = lines.length > 0 ? lines : [
        `${participantNames[0]}: This is an interesting topic about ${topic}.`,
        `${participantNames[1]}: I agree, there are many aspects to consider when discussing ${topic}.`
      ];
    }

    if (!Array.isArray(conversationData) || conversationData.length === 0) {
      throw new Error('Invalid conversation data generated');
    }

    const validatedConversation = conversationData
      .filter((line: unknown) => typeof line === 'string' && line.includes(':'))
      .slice(0, 15)
      .map((line: string) => line.trim());

    if (validatedConversation.length < 4) {
      throw new Error('Generated conversation is too short');
    }

    return NextResponse.json({
      conversation: validatedConversation,
      topic,
      participants,
      success: true
    });

  } catch (error: any) {
    console.error('OpenRouter API Error:', error);

    let errorMessage = 'Failed to generate conversation';
    if (error.message?.includes('401')) {
      errorMessage = 'Invalid OpenRouter API key';
    } else if (error.message?.includes('429') || error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded, please try again later';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error, please check your connection';
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}