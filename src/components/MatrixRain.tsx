'use client'

import { useEffect, useRef } from 'react'

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789ABCDEF<>[]{}$#@%&*'

interface MatrixRainProps {
  /** Fade intensity 0–1 */
  intensity?: number
  className?: string
}

/** Faint Matrix-style code rain behind the orbit axis. */
export function MatrixRain({ intensity = 0.55, className = '' }: MatrixRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let running = true
    let w = 0
    let h = 0
    let cols = 0
    let drops: number[] = []
    let speeds: number[] = []

    const fontSize = 14

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      w = Math.max(1, Math.floor(rect.width))
      h = Math.max(1, Math.floor(rect.height))
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      cols = Math.ceil(w / fontSize)
      drops = Array.from({ length: cols }, () => Math.random() * -40)
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.85)
    }

    const draw = () => {
      if (!running) return
      // Trail fade
      ctx.fillStyle = 'rgba(5, 6, 10, 0.12)'
      ctx.fillRect(0, 0, w, h)

      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`

      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0]
        const x = i * fontSize
        const y = drops[i] * fontSize

        // Head brighter
        const head = (i / cols) * 0.5 + 0.5
        ctx.fillStyle = `rgba(184, 255, 60, ${0.55 * intensity * head})`
        ctx.shadowColor = 'rgba(0, 229, 255, 0.35)'
        ctx.shadowBlur = 6
        ctx.fillText(ch, x, y)
        ctx.shadowBlur = 0

        // Occasional cyan highlight
        if (Math.random() > 0.97) {
          ctx.fillStyle = `rgba(0, 229, 255, ${0.7 * intensity})`
          ctx.fillText(ch, x, y)
        }

        if (y > h && Math.random() > 0.975) {
          drops[i] = 0
        }
        drops[i] += speeds[i]
      }

      raf = requestAnimationFrame(draw)
    }

    const paintStatic = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`
      for (let i = 0; i < cols; i += 2) {
        const y = ((i * 37) % h) + 10
        const ch = GLYPHS[(i * 13) % GLYPHS.length]
        ctx.fillStyle = `rgba(184, 255, 60, ${0.2 * intensity})`
        ctx.fillText(ch, i * fontSize, y)
      }
    }

    resize()
    if (reduce) {
      paintStatic()
    } else {
      raf = requestAnimationFrame(draw)
    }

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
    if (canvas.parentElement) ro?.observe(canvas.parentElement)
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro?.disconnect()
      window.removeEventListener('resize', resize)
    }
  }, [intensity])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={{
        width: 'min(72%, 720px)',
        height: 'min(70%, 420px)',
        maskImage:
          'radial-gradient(ellipse at center, #000 0%, #000 35%, transparent 72%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, #000 0%, #000 35%, transparent 72%)',
        opacity: 0.9,
        mixBlendMode: 'screen',
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
