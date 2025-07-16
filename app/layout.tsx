'use client'

import { useState, useRef, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"

export default function Home() {
  const [inputText, setInputText] = useState("")
  const [responseText, setResponseText] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!inputText) return
    setIsLoading(true)
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: inputText }),
    })
    const data = await res.json()
    setResponseText(data.result)
    setIsLoading(false)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-2xl space-y-6">
        <h1 className="text-4xl font-bold text-center">Welcome to OBIO I6</h1>
        <div className="space-y-2">
          <Label htmlFor="inputText">Enter your prompt</Label>
          <Textarea
            id="inputText"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type something..."
            className="min-h-[100px]"
          />
        </div>
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Generate
            </>
          )}
        </Button>
        {responseText && (
          <Card>
            <CardContent className="p-4 whitespace-pre-wrap">
              {responseText}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
