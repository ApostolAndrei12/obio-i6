"use client"

import { Brain } from "lucide-react"

export function Footer() {
  return (
    <footer className="backdrop-blur-xl border-t border-white/10 py-16 px-4 relative z-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 md:mb-0">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Obio.ai
            </span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-gray-400">
            <a href="#" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-gray-400">
          <p>© 2025 Obio.ai. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
