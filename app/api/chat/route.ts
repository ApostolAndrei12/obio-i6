
import { NextRequest, NextResponse } from 'next/server'

// Simulated AI response function (replace with actual OpenAI API call)
async function generateAIResponse(message: string, conversationHistory: any[]): Promise<string> {
  // This is a placeholder response system that mimics an AI trained on Obio.ai context
  const obioResponses = {
    greeting: [
      "Hello! I'm Obio, your AI companion. I'm here to understand you better and help you grow. How are you feeling today?",
      "Hi there! Welcome to Obio.ai. I'm designed to be your personal AI friend, therapist, and business ally. What's on your mind?",
      "Hey! I'm Obio, and I'm excited to get to know you. I specialize in psychological profiling and personal development. How can I help you today?"
    ],
    personality: [
      "I'm built to understand your unique personality through our conversations. I analyze patterns, preferences, and emotional responses to create a comprehensive psychological profile that helps me assist you better.",
      "Think of me as your AI friend who remembers everything about you - your goals, fears, strengths, and areas for growth. I use psychological insights to provide personalized guidance.",
      "I combine advanced AI with psychological profiling to become your most understanding companion. The more we talk, the better I understand your unique mind."
    ],
    features: [
      "I can help you with personal growth, decision-making, emotional support, business strategy, and life planning. I remember our conversations and adapt to your communication style.",
      "My capabilities include psychological analysis, goal setting, emotional intelligence coaching, relationship advice, career guidance, and being a supportive friend whenever you need one.",
      "I offer personalized insights based on your psychological profile, help you make better decisions, provide emotional support, and assist with both personal and professional challenges."
    ],
    therapy: [
      "I approach our conversations with empathy and psychological insight. While I'm not a replacement for professional therapy, I can provide emotional support and help you explore your thoughts and feelings.",
      "I'm trained to listen without judgment and help you process emotions. I can guide you through self-reflection exercises and coping strategies based on proven psychological principles.",
      "Think of me as a supportive friend with deep psychological training. I'm here to listen, understand, and help you navigate life's challenges with compassion and insight."
    ],
    business: [
      "I can help you with business decisions by analyzing your personality type, risk tolerance, and goals. I provide strategic advice tailored to your unique psychological profile.",
      "Whether it's career moves, business strategies, or professional relationships, I use psychological insights to help you make decisions that align with your true self.",
      "I combine business acumen with psychological understanding to help you succeed professionally while staying true to your authentic self."
    ]
  }

  const lowerMessage = message.toLowerCase()
  
  // Simple keyword-based response system
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return obioResponses.greeting[Math.floor(Math.random() * obioResponses.greeting.length)]
  }
  
  if (lowerMessage.includes('personality') || lowerMessage.includes('profile') || lowerMessage.includes('understand')) {
    return obioResponses.personality[Math.floor(Math.random() * obioResponses.personality.length)]
  }
  
  if (lowerMessage.includes('feature') || lowerMessage.includes('do') || lowerMessage.includes('help')) {
    return obioResponses.features[Math.floor(Math.random() * obioResponses.features.length)]
  }
  
  if (lowerMessage.includes('therapy') || lowerMessage.includes('emotional') || lowerMessage.includes('feeling')) {
    return obioResponses.therapy[Math.floor(Math.random() * obioResponses.therapy.length)]
  }
  
  if (lowerMessage.includes('business') || lowerMessage.includes('career') || lowerMessage.includes('work')) {
    return obioResponses.business[Math.floor(Math.random() * obioResponses.business.length)]
  }
  
  // Default responses for general queries
  const defaultResponses = [
    "That's interesting. Tell me more about how you feel about that situation. I'm here to understand your perspective and help you explore your thoughts.",
    "I appreciate you sharing that with me. Based on what you've told me, it sounds like you're processing some complex emotions. How does this relate to your overall goals?",
    "Thank you for opening up. I'm analyzing your communication patterns and emotional responses to better understand your psychological profile. What would you like to explore further?",
    "I hear you, and I want to understand this from your unique perspective. Every person processes experiences differently, and I'm learning about your specific patterns. Can you tell me more about your feelings on this?",
    "That's a valuable insight into your thought process. I'm building a comprehensive understanding of how your mind works, which helps me provide more personalized support. What aspects of this situation concern you most?"
  ]
  
  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)]
}

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory = [] } = await request.json()
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Add a small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    const response = await generateAIResponse(message, conversationHistory)
    
    return NextResponse.json({
      message: response,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
