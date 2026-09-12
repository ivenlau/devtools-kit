'use client'

import { useEffect, useRef } from 'react'

interface MouseGlowProps {
  className?: string
  defaultX?: number
  defaultY?: number
}

/**
 * Cursor-tracking neon spotlight. Writes --glow-x/--glow-y (px) on the host
 * so CSS can follow the pointer without re-rendering React.
 */
export function MouseGlow({
  className = '',
  defaultX = 0.22,
  defaultY = 0.32,
}: MouseGlowProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let raf = 0
    let running = true
    let rect = el.getBoundingClientRect()
    let targetX = defaultX * rect.width
    let targetY = defaultY * rect.height
    let curX = targetX
    let curY = targetY

    const measure = () => {
      rect = el.getBoundingClientRect()
    }

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX - rect.left
      targetY = e.clientY - rect.top
    }

    const apply = () => {
      curX += (targetX - curX) * 0.14
      curY += (targetY - curY) * 0.14
      el.style.setProperty('--glow-x', `${curX.toFixed(1)}px`)
      el.style.setProperty('--glow-y', `${curY.toFixed(1)}px`)
      if (running) raf = requestAnimationFrame(apply)
    }

    el.style.setProperty('--glow-x', `${targetX}px`)
    el.style.setProperty('--glow-y', `${targetY}px`)

    // Track on window — the glow layer itself is pointer-events: none
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    window.addEventListener('scroll', measure, { passive: true })
    raf = requestAnimationFrame(apply)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [defaultX, defaultY])

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="mouse-glow-orb mouse-glow-orb--cyan"
        style={{
          left: 'var(--glow-x, 20%)',
          top: 'var(--glow-y, 30%)',
        }}
      />
      <div
        className="mouse-glow-orb mouse-glow-orb--magenta"
        style={{
          left: 'calc(var(--glow-x, 20%) + 80px)',
          top: 'calc(var(--glow-y, 30%) + 56px)',
        }}
      />
    </div>
  )
}
