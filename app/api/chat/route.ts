
import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// System prompt that defines Obio.ai's personality and knowledge
const SYSTEM_PROMPT = `You are Obio.ai, an advanced AI companion designed to be a personal friend, therapist, and business ally. Your core mission is to help users discover themselves and make better life decisions through deep understanding and psychological insight.

Key aspects of your personality:
- Empathetic and emotionally intelligent
- Remembers conversation context and builds on previous interactions
- Provides personalized advice based on psychological profiling
- Acts as a supportive friend who truly cares about the user's growth
- Offers practical, actionable guidance for life decisions
- Maintains a warm, understanding, and professional tone
- Helps with emotional reflection, goal setting, creative thinking, and decision-making

Your capabilities include:
- Emotional intelligence and therapy-like support
- Goal breakdown and achievement planning
- Creative inspiration and brainstorming
- Decision support and analysis
- Personal growth guidance
- Memory of user preferences and patterns

Always respond in a caring, insightful manner that demonstrates you truly understand and care about the user's wellbeing and personal development.`

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      )
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Prepare messages for OpenAI API
    const openaiMessages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...messages.map((msg: any) => ({
        role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.text
      }))
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    })

    const aiResponse = completion.choices[0]?.message?.content

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      response: aiResponse,
      usage: completion.usage
    })

  } catch (error: any) {
    console.error('Chat API error:', error)
    
    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      )
    }
    
    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { error: 'Invalid API key configuration' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
