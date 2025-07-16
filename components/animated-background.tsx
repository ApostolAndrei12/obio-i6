"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      opacity: number
      hue: number
      pulse: number
    }> = []

    // Create more subtle neural network particles for a starry/light effect
    for (let i = 0; i < 200; i++) {
      // Increased particle count for more density
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.1, // Slightly faster horizontal
        vy: (Math.random() - 0.5) * 0.1 + 0.05, // Slightly faster vertical with a downward bias
        size: Math.random() * 0.4 + 0.1, // Slightly smaller base size
        opacity: Math.random() * 0.08 + 0.02, // Slightly higher base opacity
        hue: Math.random() * 90 + 220, // Range from cool blues (220) to purples (310)
        pulse: Math.random() * Math.PI * 2,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.pulse += 0.05 // Faster pulse for more noticeable flicker

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Ensure pulseSize is never negative
        const pulseSize = Math.max(0.01, particle.size + Math.sin(particle.pulse) * 0.15) // More pronounced size pulse for flicker

        // Subtle glow
        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, pulseSize * 5) // Increased gradient radius slightly for softer glow
        gradient.addColorStop(0, `hsla(${particle.hue}, 80%, 80%, ${particle.opacity * 3})`) // Brighter, more saturated core glow
        gradient.addColorStop(1, `hsla(${particle.hue}, 80%, 80%, 0)`)

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulseSize * 5, 0, Math.PI * 2) // Increased glow size
        ctx.fillStyle = gradient
        ctx.fill()

        // Core particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, pulseSize, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 90%, ${particle.opacity * 4})` // Even brighter, more saturated core
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: "radial-gradient(ellipse at center, #030303 0%, #000000 100%)", // Slightly darker center
      }}
    />
  )
}
