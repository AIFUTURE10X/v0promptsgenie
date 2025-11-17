"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speedX: number
  speedY: number
  depth: number
}

export function FloatingParticles({ hovering }: { hovering: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize particles
    const particleCount = 80
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1, // 1-4px
      opacity: Math.random() * 0.5 + 0.2, // 0.2-0.7
      speedX: (Math.random() - 0.5) * 0.3, // Slow horizontal drift
      speedY: (Math.random() - 0.5) * 0.3, // Slow vertical drift
      depth: Math.random(), // 0-1 for parallax effect
    }))

    // Mouse move handler for parallax
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      }
    }
    window.addEventListener("mousemove", handleMouseMove)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        // Update position with gentle floating
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Add parallax effect based on mouse position
        const parallaxX = (mouseRef.current.x - canvas.width / 2) * particle.depth * 0.02
        const parallaxY = (mouseRef.current.y - canvas.height / 2) * particle.depth * 0.02

        // Wrap around edges
        if (particle.x < -10) particle.x = canvas.width + 10
        if (particle.x > canvas.width + 10) particle.x = -10
        if (particle.y < -10) particle.y = canvas.height + 10
        if (particle.y > canvas.height + 10) particle.y = -10

        // Draw particle with parallax offset
        ctx.beginPath()
        ctx.arc(particle.x + parallaxX, particle.y + parallaxY, particle.size, 0, Math.PI * 2)

        // Add subtle glow effect when hovering
        if (hovering) {
          ctx.shadowBlur = 10
          ctx.shadowColor = `rgba(255, 255, 255, ${particle.opacity * 0.5})`
        } else {
          ctx.shadowBlur = 0
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.fill()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", handleMouseMove)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [hovering])

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full" style={{ background: "#000" }} />
}
