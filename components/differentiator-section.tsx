"use client"

import { X, Check } from "lucide-react"
import { motion } from "framer-motion"

const comparisons = [
  {
    feature: "Memory & Context",
    traditional: "Forgets previous conversations",
    obio: "Remembers everything, builds on past interactions",
  },
  {
    feature: "Personalization",
    traditional: "Generic responses for everyone",
    obio: "Adapts to your unique personality & style",
  },
  {
    feature: "Emotional Intelligence",
    traditional: "Limited understanding of emotions",
    obio: "Deep empathy and emotional awareness",
  },
  {
    feature: "Growth Tracking",
    traditional: "No progress monitoring",
    obio: "Tracks your personal development journey",
  },
  {
    feature: "Decision Support",
    traditional: "Basic information retrieval",
    obio: "Contextual guidance based on your values",
  },
]

export function DifferentiatorSection() {
  return (
    <section className="relative py-32 px-4">
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
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Why Obio is</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Different
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Unlike traditional AI assistants, Obio creates a deep, personal connection that evolves with you.
          </p>
        </motion.div>

        {/* Comparison Table */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-3xl blur-xl" />

          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-px bg-white/10">
              <div className="p-6 bg-black/20">
                <h3 className="text-lg font-semibold text-gray-400">Feature</h3>
              </div>
              <div className="p-6 bg-black/20">
                <h3 className="text-lg font-semibold text-gray-400">Traditional AI</h3>
              </div>
              <div className="p-6 bg-black/20">
                <h3 className="text-lg font-semibold text-purple-400">Obio.ai</h3>
              </div>
            </div>

            {/* Comparison Rows */}
            {comparisons.map((comparison, index) => (
              <motion.div
                key={comparison.feature}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="grid grid-cols-3 gap-px bg-white/5 hover:bg-white/10 transition-colors duration-300"
              >
                <div className="p-6 bg-black/20">
                  <p className="font-medium text-white">{comparison.feature}</p>
                </div>
                <div className="p-6 bg-black/20">
                  <div className="flex items-center gap-3">
                    <X className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-gray-400">{comparison.traditional}</p>
                  </div>
                </div>
                <div className="p-6 bg-black/20">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                    <p className="text-white">{comparison.obio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
