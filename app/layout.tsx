"use client"

import { useEffect, useRef, useState } from "react"
import { SparklesCore } from "@/components/ui/sparkles"

export default function Home() {
  const [summarizeInput, setSummarizeInput] = useState("")
  const [isProcessingSummarize, setIsProcessingSummarize] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const authModalRef = useRef<HTMLDivElement>(null)
  const upgradeModalRef = useRef<HTMLDivElement>(null)
  const advancedFeaturesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [summarizeInput])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="h-[40rem] w-full bg-black flex flex-col items-center justify-center overflow-hidden rounded-md">
        <div className="w-full absolute inset-0 h-screen">
          <SparklesCore
            background="black"
            minSize={0.4}
            maxSize={1}
            particleDensity={1200}
            className="w-full h-full"
            particleColor="#FFFFFF"
          />
        </div>
        <h1 className="md:text-7xl text-4xl lg:text-9xl font-bold relative text-white">
          Obio.ai
        </h1>
        <p className="text-white text-lg mt-4 z-10 relative text-center max-w-xl">
          Your personal AI companion for self-discovery and better life decisions.
        </p>
      </div>

      {/* Chatbot widget – Biel.ai */}
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/biel-search/dist/biel-search/biel-search.css" />
      <script type="module" src="https://cdn.jsdelivr.net/npm/biel-search/dist/biel-search/biel-search.esm.js"></script>
      <biel-button
        project="rrcrfrnu7r"
        header-title="Biel.ai Chatbot"
        button-position="bottom-right"
        modal-position="sidebar-right"
        button-style="dark">
        Ask AI
      </biel-button>
    </main>
  )
}
