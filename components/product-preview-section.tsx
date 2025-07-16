"use client"

import { MessageCircle, Brain, TrendingUp, Zap } from "lucide-react"
import { useState, useEffect } from "react"

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState(0)
  const [messageIndex, setMessageIndex] = useState(0)

  const messages = [
    "Should I take the job offer in Berlin?",
    "How can I improve my morning routine?",
    "What's the best way to handle this conflict?",
    "Help me plan my next career move",
  ]

  const responses = [
    "Based on your values and past decisions, Berlin aligns with your growth goals. Consider the impact on your relationships and long-term vision...",
    "Your energy peaks at 7 AM. I suggest meditation, then your most important task. Your productivity patterns show this works best...",
    "Given your communication style and past conflicts, try the direct but empathetic approach. Here's what worked before...",
    "Your skills in design and leadership are growing. Three paths align with your goals: senior role, startup, or consulting...",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-6xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Experience the
            </span>{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Future</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            See how Obio transforms complex life decisions into clear, actionable insights.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Interactive Chat Preview */}
          <div className="relative">
            <div className="relative bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 p-6 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white font-medium">Obio AI</span>
                <div className="ml-auto flex gap-1">
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                  <div className="w-3 h-3 bg-white/20 rounded-full" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 h-96 overflow-hidden">
                <div className="flex justify-end">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-3 rounded-2xl rounded-tr-md max-w-xs">
                    <p className="text-sm">{messages[messageIndex]}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl rounded-tl-md max-w-sm">
                    <p className="text-sm text-gray-300">{responses[messageIndex]}</p>
                  </div>
                </div>

                {/* Typing Indicator */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-3 rounded-2xl rounded-tl-md">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Input */}
              <div className="p-6 border-t border-white/10">
                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full px-4 py-3">
                  <input
                    type="text"
                    placeholder="Ask Obio anything..."
                    className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none"
                  />
                  <button className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Zap className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-pulse">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-8">
            <div className="group cursor-pointer">
              <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-cyan-400/50 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Deep Understanding</h3>
                  <p className="text-gray-400">Remembers context from every conversation</p>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-purple-400/50 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Predictive Insights</h3>
                  <p className="text-gray-400">Anticipates your needs and goals</p>
                </div>
              </div>
            </div>

            <div className="group cursor-pointer">
              <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 hover:border-green-400/50 hover:bg-white/10 transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Instant Clarity</h3>
                  <p className="text-gray-400">Complex decisions made simple</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
