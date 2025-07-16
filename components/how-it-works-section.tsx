"use client"

import { Brain, MessageSquare, TrendingUp } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    icon: Brain,
    title: "Take the Test",
    subtitle: "Discover your unique profile",
    description:
      "Complete our advanced psychological assessment to help Obio understand your personality, decision-making style, and communication preferences.",
    gradient: "from-purple-500 to-pink-600",
    delay: 0,
  },
  {
    icon: MessageSquare,
    title: "Start Chatting",
    subtitle: "Interact daily with your AI",
    description:
      "Engage in meaningful conversations with Obio. Share your thoughts, dilemmas, and goals as it learns and adapts to your unique perspective.",
    gradient: "from-blue-500 to-cyan-600",
    delay: 200,
  },
  {
    icon: TrendingUp,
    title: "Get Smarter Advice",
    subtitle: "Evolve with personalized guidance",
    description:
      "Receive increasingly personalized insights and recommendations as Obio develops a deeper understanding of your patterns and aspirations.",
    gradient: "from-green-500 to-emerald-600",
    delay: 400,
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-32 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">How It</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Three simple steps to unlock your personal AI companion that grows smarter with every interaction.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px">
            <div className="relative w-full h-full">
              <div className="absolute left-1/6 right-1/6 h-full bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-green-500/30" />
              <div className="absolute left-1/6 w-4 h-4 bg-purple-500 rounded-full -translate-y-1/2" />
              <div className="absolute left-1/2 w-4 h-4 bg-blue-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute right-1/6 w-4 h-4 bg-green-500 rounded-full translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: step.delay / 1000 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Card */}
                <div className="relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-black border border-white/20 rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-purple-400 font-medium mb-4">{step.subtitle}</p>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>

                  {/* Hover Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${step.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
