"use client"

import { MessageCircle, Brain, Send } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const conversations = [
  {
    user: "I'm struggling with whether to take this new job offer. It pays more but requires relocating.",
    ai: "I remember you mentioned valuing work-life balance and being close to family. Let's explore what matters most to you in this decision. What aspects of the new role excite you most?",
  },
  {
    user: "I keep procrastinating on important tasks and I don't know why.",
    ai: "Based on our previous conversations, I notice this happens when you feel overwhelmed by perfectionism. You mentioned this pattern before with your project deadlines. What if we break this task into smaller, less intimidating steps?",
  },
  {
    user: "I had an argument with my partner and I'm not sure how to approach making up.",
    ai: "You've shared that you both have different communication styles - you prefer direct conversation while they need time to process. Given what I know about your relationship dynamics, have you considered giving them some space first before initiating the conversation?",
  },
]

export function ChatPreviewSection() {
  const [currentConversation, setCurrentConversation] = useState(0)
  const [showUser, setShowUser] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const sequence = async () => {
      setShowUser(false)
      setShowAI(false)
      setIsTyping(false)

      // Show user message
      setTimeout(() => setShowUser(true), 500)

      // Show typing indicator
      setTimeout(() => setIsTyping(true), 2000)

      // Show AI response
      setTimeout(() => {
        setIsTyping(false)
        setShowAI(true)
      }, 4000)

      // Move to next conversation
      setTimeout(() => {
        setCurrentConversation((prev) => (prev + 1) % conversations.length)
      }, 8000)
    }

    sequence()
    const interval = setInterval(sequence, 10000)
    return () => clearInterval(interval)
  }, [currentConversation])

  return (
    <section id="demo" className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">See Obio</span>{" "}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Watch how Obio provides personalized, contextual guidance by remembering your past conversations and
            understanding your unique perspective.
          </p>
        </motion.div>

        {/* Chat Interface */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-3xl blur-xl" />

            {/* Chat Container */}
            <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">Obio AI</span>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      Understanding & Learning
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full" />
                  <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                </div>
              </div>

              {/* Messages */}
              <div className="p-8 space-y-6 h-96 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div key={currentConversation} className="space-y-6">
                    {/* User Message */}
                    <AnimatePresence>
                      {showUser && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex justify-end"
                        >
                          <div className="max-w-[80%] bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-4 rounded-2xl rounded-tr-md">
                            <p className="text-sm leading-relaxed">{conversations[currentConversation].user}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Typing Indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl rounded-tl-md">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100" />
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* AI Response */}
                    <AnimatePresence>
                      {showAI && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex justify-start"
                        >
                          <div className="flex items-start gap-3 max-w-[80%]">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl rounded-tl-md">
                              <p className="text-sm text-gray-200 leading-relaxed">
                                {conversations[currentConversation].ai}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4">
                  <MessageCircle className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Share what's on your mind..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                    readOnly
                  />
                  <button className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
