"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Brain, Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function FloatingNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "How it Works", href: "#how-it-works" },
    { label: "See Demo", href: "#demo" },
    { label: "Pricing", href: "#pricing" },
  ]

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsOpen(false)
    }
  }

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 hidden lg:block transition-all duration-300 ${
          scrolled ? "scale-95" : "scale-100"
        }`}
      >
        <div className="flex items-center gap-8 px-8 py-4 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">Obio.ai</span>
          </div>

          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.href)}
              className="text-gray-300 hover:text-white transition-colors duration-300 font-medium"
            >
              {item.label}
            </button>
          ))}

          <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white border-0 rounded-full px-6">
            Get Started
          </Button>
        </div>
      </motion.nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-6 right-6 z-50 w-12 h-12 bg-black/20 backdrop-blur-2xl border border-white/10 rounded-full hover:bg-white/10"
        >
          {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </Button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 h-full w-80 bg-black/90 backdrop-blur-2xl border-l border-white/10 z-40"
              >
                <div className="p-6 pt-20">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Obio.ai</span>
                  </div>

                  <div className="space-y-4">
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => scrollToSection(item.href)}
                        className="w-full text-left p-4 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
                      >
                        {item.label}
                      </button>
                    ))}
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-400 hover:to-blue-500 text-white border-0 rounded-full mt-6">
                      Get Started
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
