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

    // Create participant names based on count
    const participantNames = participants === 2 
      ? ['Alex', 'Jordan'] 
      : ['Alex', 'Jordan', 'Casey'];

    // Create a detailed prompt for conversation generation
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

Format your response as a JSON array where each element is a string representing one person's dialogue. Each string should start with the speaker's name followed by a colon and their dialogue.

Example format:
[
  "Alex: I think this topic is really fascinating because...",
  "Jordan: That's an interesting point, Alex. I've always wondered about...",
  "Alex: You raise a good question. From what I understand..."
]

Topic: ${topic}
Number of participants: ${participants}
Participant names: ${participantNames.join(', ')}

IMPORTANT: Respond ONLY with the JSON array, no additional text or explanation.`;

    // Make request to OpenRouter using DeepSeek R1 (Free)
    const deepseekResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Conversation Generator'
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        stream: false
      }),
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json().catch(() => ({}));
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${deepseekResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await deepseekResponse.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenRouter');
    }

    const generatedText = data.choices[0].message.content;

    // Try to extract JSON from the response
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    let conversationData;

    if (jsonMatch) {
      try {
        conversationData = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        console.log('Generated text:', generatedText);
        throw new Error('Failed to parse AI response as JSON');
      }
    } else {
      // Fallback parsing if JSON extraction fails
      console.warn('No JSON found in response, using fallback parsing');
      console.log('Generated text:', generatedText);
      
      // Try to extract conversation lines from the text
      const lines = generatedText
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed && trimmed.includes(':') && !trimmed.startsWith('[') && !trimmed.startsWith(']');
        })
        .map(line => line.trim().replace(/^["']|["']$/g, '').replace(/,\s*$/, ''))
        .slice(0, 12); // Limit to 12 lines max
      
      conversationData = lines.length > 0 ? lines : [
        `${participantNames[0]}: This is an interesting topic about ${topic}. I think it's important to understand the various perspectives and implications it presents.`,
        `${participantNames[1]}: I agree, ${participantNames[0]}. There are many aspects to consider when discussing ${topic}. What's your take on the current developments in this area?`,
        `${participantNames[0]}: Well, from what I've observed, the key challenge is finding the right balance. We need to consider both the benefits and potential drawbacks.`,
        `${participantNames[1]}: That's a nuanced perspective. I think the context really matters here, and we should look at real-world examples to better understand the implications.`
      ];
    }

    // Validate the response
    if (!Array.isArray(conversationData) || conversationData.length === 0) {
      throw new Error('Invalid conversation data generated');
    }

    // Ensure each line has a speaker and content
    const validatedConversation = conversationData
      .filter(line => typeof line === 'string' && line.includes(':'))
      .slice(0, 15) // Maximum 15 exchanges
      .map(line => line.trim());

    if (validatedConversation.length < 4) {
      throw new Error('Generated conversation is too short');
    }

    return NextResponse.json({
      conversation: validatedConversation,
      topic: topic,
      participants: participants,
      success: true
    });

  } catch (error: any) {
    console.error('DeepSeek/OpenRouter API Error:', error);
    
    // Return a more user-friendly error
    let errorMessage = 'Failed to generate conversation';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'API configuration error. Please check your OpenRouter API key.';
    } else if (error.message?.includes('quota') || error.message?.includes('limit') || error.message?.includes('rate')) {
      errorMessage = 'API quota exceeded or rate limited. Please try again later.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    } else if (error.message?.includes('parse') || error.message?.includes('JSON')) {
      errorMessage = 'AI response format error. Please try again with a different topic.';
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