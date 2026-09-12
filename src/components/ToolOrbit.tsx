'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import { MatrixRain } from '@/components/MatrixRain'

export interface OrbitTool {
  href: string
  name: string
  desc: string
  icon: LucideIcon
  accent: string
  tag?: string
  path?: string
}

interface ToolOrbitProps {
  tools: OrbitTool[]
  autoRotateSpeed?: number
  /** When set, spin this card to front, pause, and highlight (same as hover). */
  focusIndex?: number | null
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** 8 cards: radius ≥ cardW / (2 sin(π/8)) */
const gapRadius = (cardW: number, n: number) =>
  (cardW / (2 * Math.sin(Math.PI / n))) * 1.05

/**
 * 3D orbit carousel.
 * Geometry is derived from live viewport + measured band height.
 */
export function ToolOrbit({
  tools,
  autoRotateSpeed = 0.12,
  focusIndex = null,
}: ToolOrbitProps) {
  const n = tools.length
  const step = 360 / n
  const [rotation, setRotation] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [ready, setReady] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [vp, setVp] = useState({ w: 1280, h: 800, bandH: 420, bandW: 1200 })
  const wrapRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startRot: 0, moved: 0 })
  const rotRef = useRef(rotation)
  rotRef.current = rotation
  const spinRaf = useRef(0)

  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Always track viewport + band; rAF-throttle so drag-resize is smooth
  useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      const el = wrapRef.current
      const w = window.innerWidth
      const h = window.innerHeight
      const rect = el?.getBoundingClientRect()
      setVp({
        w,
        h,
        bandW: rect && rect.width > 40 ? rect.width : w,
        bandH: rect && rect.height > 60 ? rect.height : h * 0.45,
      })
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }

    schedule()
    window.addEventListener('resize', schedule, { passive: true })
    window.addEventListener('orientationchange', schedule, { passive: true })
    window.addEventListener('scroll', schedule, { passive: true })

    const el = wrapRef.current
    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null
    if (el) ro?.observe(el)
    if (el?.parentElement) ro?.observe(el.parentElement)

    // Catch late layout (fonts, first paint)
    const t1 = window.setTimeout(schedule, 100)
    const t2 = window.setTimeout(schedule, 400)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('orientationchange', schedule)
      window.removeEventListener('scroll', schedule)
      ro?.disconnect()
    }
  }, [])

  // Auto-rotate — pause while dragging, hovering, or focused via search
  const locked = dragging || hoveredIndex !== null || focusIndex !== null
  useEffect(() => {
    if (locked || !ready) return
    let raf = 0
    const tick = () => {
      setRotation((r) => r + autoRotateSpeed)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [locked, ready, autoRotateSpeed])

  // Spin focused card to front (shortest path, fast ease-out)
  useEffect(() => {
    if (focusIndex === null || focusIndex < 0 || focusIndex >= n) return
    cancelAnimationFrame(spinRaf.current)

    const targetBase = -focusIndex * step
    const start = rotRef.current
    // Normalize delta to (-180, 180]
    let delta = ((targetBase - start) % 360 + 540) % 360 - 180
    const duration = 420
    const t0 = performance.now()

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration)
      // ease-out cubic
      const e = 1 - Math.pow(1 - t, 3)
      const next = start + delta * e
      setRotation(next)
      if (t < 1) {
        spinRaf.current = requestAnimationFrame(tick)
      }
    }
    spinRaf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(spinRaf.current)
  }, [focusIndex, n, step])

  // Effective highlight: search focus wins over hover
  const activeIndex = focusIndex !== null ? focusIndex : hoveredIndex

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return
    drag.current = { active: true, startX: e.clientX, startRot: rotRef.current, moved: 0 }
    setDragging(true)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return
    const dx = e.clientX - drag.current.startX
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx))
    if (drag.current.moved > 4) {
      // Capture only once the gesture turns into a drag — pointer capture
      // retargets the browser click to the stage, which would swallow
      // plain clicks on the card links.
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    }
    setRotation(drag.current.startRot + dx * 0.35)
  }, [])

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.active = false
    setDragging(false)
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
  }, [])

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (drag.current.moved > 8) {
      e.preventDefault()
      e.stopPropagation()
      drag.current.moved = 0
    }
  }, [])

  // Geometry: scale hard with both axes so large windows get large cards
  // Keep cards large even with 21 tools — only mild density taper
  const geo = useMemo(() => {
    const { w, h, bandH, bandW } = vp
    const stageH = Math.max(bandH, h * 0.32)
    const stageW = Math.max(bandW, w)
    const density = clamp(16 / Math.max(n, 1), 0.78, 1) // 21 cards ≈ 0.78

    let cardW = Math.round(
      clamp(Math.min(stageH * 0.42 * density, stageW * 0.18 * density), 120, 320)
    )
    let radius = Math.round(
      clamp(
        Math.min(stageW * 0.42, stageH * 1.25, gapRadius(cardW, n) * 1.08),
        160,
        720
      )
    )

    if (radius < gapRadius(cardW, n)) {
      radius = Math.round(gapRadius(cardW, n))
    }

    const maxR = Math.round(Math.min(stageW * 0.52, 760))
    if (radius > maxR) {
      radius = maxR
      cardW = Math.round(
        clamp((radius * 2 * Math.sin(Math.PI / n)) / 1.04, 100, 320)
      )
    }

    if (cardW * 1.22 > stageH * 0.82) {
      cardW = Math.round(Math.max(100, (stageH * 0.82) / 1.22))
    }

    const cardH = Math.round(cardW * 1.22)
    const perspective = Math.round(clamp(radius * 4.5, 1200, 2600))
    // Decorative glow must stay inside the band, or its box extends the
    // scrollable area of the hero (which computes overflow-y as auto).
    const glowW = Math.round(radius * 2.2)
    const glowH = Math.min(Math.round(radius * 1.4), Math.round(bandH))
    return { cardW, cardH, radius, perspective, glowW, glowH }
  }, [vp, n])

  const { cardW: cardWidth, cardH: cardHeight, radius, perspective, glowW, glowH } = geo

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto h-full w-full select-none"
      style={{ minHeight: 240 }}
    >
      <div
        aria-hidden
        className="orbit-glow pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] opacity-60"
        style={{
          width: glowW,
          height: glowH,
          filter: 'blur(8px)',
        }}
      />

      {/* Matrix rain at the orbit axis */}
      <MatrixRain intensity={0.5} className="z-0" />

      <div
        className="orbit-stage absolute inset-0 z-10 cursor-grab touch-none active:cursor-grabbing"
        style={{ perspective: `${perspective}px` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className="orbit-ring absolute left-1/2 top-[46%]"
          style={{
            width: 0,
            height: 0,
            transformStyle: 'preserve-3d',
            transform: `translate(-50%, -50%) rotateX(-10deg) rotateY(${rotation}deg)`,
          }}
        >
          {tools.map((tool, i) => {
            const Icon = tool.icon
            const angle = i * step
            const isHot = activeIndex === i
            const zPush = isHot ? radius + 36 : radius
            const scale = isHot ? 1.1 : 1
            return (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={handleClick}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex((cur) => (cur === i ? null : cur))}
                className="orbit-card group absolute block"
                style={
                  {
                    width: cardWidth,
                    height: cardHeight,
                    left: -cardWidth / 2,
                    top: -cardHeight / 2,
                    transform: `rotateY(${angle}deg) translateZ(${zPush}px) scale(${scale})`,
                    transformStyle: 'preserve-3d',
                    zIndex: isHot ? 20 : 1,
                    transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
                    '--accent': tool.accent,
                  } as React.CSSProperties
                }
              >
                <div
                  className={`relative flex h-full flex-col rounded-xl border bg-void-100/95 backdrop-blur-sm transition-all duration-300 ${
                    isHot
                      ? 'border-[var(--accent)] shadow-[0_0_36px_color-mix(in_srgb,var(--accent)_45%,transparent)]'
                      : 'border-border-dim group-hover:border-[var(--accent)]'
                  }`}
                  style={{ padding: Math.round(cardWidth * 0.1) }}
                >
                  <div
                    className="mb-2 flex items-center justify-center rounded-lg border bg-void-200"
                    style={{
                      width: Math.round(cardWidth * 0.24),
                      height: Math.round(cardWidth * 0.24),
                      borderColor: tool.accent,
                      color: tool.accent,
                      boxShadow: `0 0 14px ${tool.accent}44`,
                    }}
                  >
                    <Icon
                      style={{
                        width: Math.round(cardWidth * 0.12),
                        height: Math.round(cardWidth * 0.12),
                      }}
                    />
                  </div>

                  {tool.tag && (
                    <span
                      className={`absolute right-2 top-2 rounded-full border px-1.5 py-0.5 font-mono tracking-wide ${
                        tool.tag === 'HOT'
                          ? 'border-neon-magenta text-neon-magenta bg-neon-magenta/10'
                          : 'border-border-dim text-ink-muted bg-void-200'
                      }`}
                      style={{ fontSize: clamp(cardWidth * 0.055, 8, 13) }}
                    >
                      {tool.tag}
                    </span>
                  )}

                  <div
                    className="font-display font-semibold leading-tight text-ink-primary"
                    style={{ fontSize: clamp(cardWidth * 0.09, 12, 18) }}
                  >
                    {tool.name}
                  </div>
                  <p
                    className="mt-1 line-clamp-3 flex-1 leading-snug text-ink-secondary"
                    style={{ fontSize: clamp(cardWidth * 0.072, 11, 14) }}
                  >
                    {tool.desc}
                  </p>
                  <div
                    className="mt-1.5 font-mono tracking-wider text-ink-muted transition-colors group-hover:text-[var(--accent)]"
                    style={{ fontSize: clamp(cardWidth * 0.062, 10, 13) }}
                  >
                    OPEN →
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
