"use client"

import { Button } from "@/components/ui/button"
import { Check, Sparkles, Crown } from "lucide-react"
import { motion } from "framer-motion"

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for getting started",
    features: [
      "Basic personality assessment",
      "50 AI conversations per month",
      "Simple decision tracking",
      "Community support",
    ],
    icon: Sparkles,
    gradient: "from-gray-500 to-gray-600",
    popular: false,
  },
  {
    name: "Premium",
    price: "$19",
    period: "per month",
    description: "For serious personal growth",
    features: [
      "Unlimited AI conversations",
      "Advanced memory & context engine",
      "Emotion tracking & insights",
      "Predictive decision modeling",
      "Priority support",
      "Data export & privacy controls",
      "Early access to new features",
    ],
    icon: Crown,
    gradient: "from-purple-500 to-blue-600",
    popular: true,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Simple</span>{" "}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Start free and upgrade when you're ready to unlock your full potential.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className={`relative group ${plan.popular ? "md:-mt-8" : ""}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`relative p-8 bg-white/5 backdrop-blur-xl rounded-3xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                  plan.popular
                    ? "border-purple-400/50 shadow-xl shadow-purple-500/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <plan.icon className="w-8 h-8 text-white" />
                </div>

                {/* Plan Info */}
                <h3 className="text-3xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                {/* Pricing */}
                <div className="flex items-baseline mb-8">
                  <span className="text-5xl font-black text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">/{plan.period}</span>
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  className={`w-full py-4 text-lg rounded-full transition-all duration-300 ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white shadow-lg hover:shadow-purple-500/25"
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40"
                  }`}
                >
                  {plan.name === "Free" ? "Get Started Free" : "Start Premium"}
                </Button>

                {/* Hover Glow */}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
