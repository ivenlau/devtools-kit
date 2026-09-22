'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Braces, FileCode, Hash, Clock, Link2, Regex, FileText, Palette,
  Binary, Shield, Database, ArrowLeftRight, QrCode, Terminal, Globe,
  RefreshCw, Image as ImageIcon, Minimize2, Code2, Monitor, CornerDownLeft
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTransferStore } from '@/stores/transferStore'
import { detectByFile, detectByContent, DetectedTool } from '@/lib/detectTool'
import { tools as allTools } from '@/lib/constants/tools'
import { accentsFor } from '@/lib/constants/accents'
import { DropZone } from '@/components/DropZone'
import { PasteHint } from '@/components/PasteHint'
import { MouseGlow } from '@/components/MouseGlow'
import { ToolOrbit } from '@/components/ToolOrbit'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/components/I18nProvider'

const iconMap: Record<string, LucideIcon> = {
  Braces,
  FileCode,
  Hash,
  Clock,
  Link2,
  Regex,
  FileText,
  Palette,
  Binary,
  Shield,
  Database,
  ArrowLeftRight,
  QrCode,
  Terminal,
  Globe,
  RefreshCw,
  Image: ImageIcon,
  Minimize2,
  Code2,
  Monitor,
}

function pathToTag(path: string): string {
  if (path === '/tools/regex' || path === '/tools/json') return 'HOT'
  if (path === '/tools/jwt' || path === '/tools/cron') return 'NEW'
  return 'P0'
}

interface ZoomState {
  href: string
  rect: DOMRect
  /** Untransformed card size (front-facing proportions) */
  cardW: number
  cardH: number
  icon: LucideIcon
  name: string
  desc: string
  accent: string
}

const ZOOM_MS = 650
const ZOOM_CENTER_MS = 260
const ZOOM_PUSH_MS = 420

/** The selected card detaches from the 3D orbit with identical styling,
 *  glides to the center of the screen, then pushes toward the viewer —
 *  growing and blurring away — before the route navigation happens. */
function CardZoomOverlay({ zoom }: { zoom: ZoomState }) {
  const [stage, setStage] = useState<'detached' | 'centered' | 'pushed'>('detached')

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage('centered'), 20)
    const t2 = window.setTimeout(() => setStage('pushed'), 20 + ZOOM_CENTER_MS)
    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [])

  const w = zoom.cardW
  // projected width of the tilted card (foreshortened by the 3D ring)
  const projScale = zoom.rect.width / w
  const cx = zoom.rect.left + zoom.rect.width / 2
  const cy = zoom.rect.top + zoom.rect.height / 2
  const dx = window.innerWidth / 2 - cx
  const dy = window.innerHeight / 2 - cy
  // push toward the viewer: grow to ~72% of the smaller viewport dim, x2
  const pushScale = ((Math.min(window.innerWidth, window.innerHeight) * 0.72) / Math.max(w, zoom.cardH)) * 2

  const transform =
    stage === 'detached'
      ? `scale(${projScale})` // still looks like the tilted card on the ring
      : stage === 'centered'
        ? `translate(${dx}px, ${dy}px)` // front-facing proportions at center
        : `translate(${dx}px, ${dy}px) scale(${pushScale})` // toward the viewer

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none" aria-hidden>
      <div
        className="orbit-card absolute overflow-hidden rounded-xl border bg-void-100/95 backdrop-blur-sm"
        style={{
          left: cx - w / 2,
          top: cy - zoom.cardH / 2,
          width: w,
          height: zoom.cardH,
          borderColor: stage === 'detached' ? 'rgb(var(--c-border-dim))' : zoom.accent,
          boxShadow:
            stage === 'detached'
              ? '0 8px 32px rgba(0, 0, 0, 0.45)'
              : `0 0 50px ${zoom.accent}66`,
          transform,
          transformOrigin: 'center',
          filter: stage === 'pushed' ? 'blur(18px)' : 'none',
          opacity: stage === 'pushed' ? 0 : 1,
          transition:
            stage === 'centered'
              ? `transform ${ZOOM_CENTER_MS}ms cubic-bezier(0.2, 0.7, 0.3, 1), border-color 200ms, box-shadow 200ms`
              : `transform ${ZOOM_PUSH_MS}ms cubic-bezier(0.3, 0.4, 0.4, 1), filter ${ZOOM_PUSH_MS}ms ease-in, opacity ${ZOOM_PUSH_MS}ms ease-in`,
        }}
      >
        <div className="relative flex h-full flex-col" style={{ padding: Math.round(w * 0.1) }}>
          <div
            className="mb-2 flex items-center justify-center rounded-lg border bg-void-200"
            style={{
              width: Math.round(w * 0.24),
              height: Math.round(w * 0.24),
              borderColor: zoom.accent,
              color: zoom.accent,
              boxShadow: `0 0 14px ${zoom.accent}44`,
            }}
          >
            <zoom.icon style={{ width: Math.round(w * 0.12), height: Math.round(w * 0.12) }} />
          </div>
          <div
            className="font-display font-semibold leading-tight text-ink-primary"
            style={{ fontSize: Math.max(12, Math.round(w * 0.09)) }}
          >
            {zoom.name}
          </div>
          <p
            className="mt-1 line-clamp-3 flex-1 leading-snug text-ink-secondary"
            style={{ fontSize: Math.max(11, Math.round(w * 0.072)) }}
          >
            {zoom.desc}
          </p>
          <div
            className="mt-1.5 font-mono tracking-wider text-ink-muted"
            style={{ fontSize: Math.max(10, Math.round(w * 0.062)) }}
          >
            OPEN →
          </div>
        </div>
      </div>
    </div>
  )
}

const TITLE_TEXT = 'DEVTOOLSKIT'
const TYPE_INTERVAL_MS = 85
const PROMPT_DELAY_MS = 150
const HOLD_MS = 2600
const RESTART_DELAY_MS = 400

/** Hero title with a looping typewriter effect: type DEVTOOLSKIT, pop in
 *  >_ with a blinking underscore, hold, then clear and start over. */
function TypingTitle() {
  const [typedCount, setTypedCount] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedCount(TITLE_TEXT.length)
      setShowPrompt(true)
      return
    }

    let cancelled = false
    const timers: number[] = []
    const schedule = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), ms))
    }
    const run = () => {
      for (let i = 1; i <= TITLE_TEXT.length; i++) {
        schedule(() => setTypedCount(i), i * TYPE_INTERVAL_MS)
      }
      const typedAt = TITLE_TEXT.length * TYPE_INTERVAL_MS
      schedule(() => setShowPrompt(true), typedAt + PROMPT_DELAY_MS)
      schedule(() => {
        setShowPrompt(false)
        setTypedCount(0)
        schedule(run, RESTART_DELAY_MS)
      }, typedAt + PROMPT_DELAY_MS + HOLD_MS)
    }
    run()

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
    }
  }, [])

  const typed = TITLE_TEXT.slice(0, typedCount)

  return (
    <h1
      className="relative font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl md:text-6xl"
      aria-label="DEVTOOLS KIT"
    >
      {/* Invisible full title reserves the box so the clear phase doesn't
          collapse the height (which would bounce the 3D orbit below) */}
      <span aria-hidden className="invisible">
        <span className="text-ink-primary">DEVTOOLS</span>
        <span className="gradient-kit ml-3">KIT</span>
        <span className="ml-1 font-mono text-neon-cyan">&gt;_</span>
      </span>
      {/* Typed overlay — fixed to the reserved box's left edge so letters
          type in place instead of re-centering on every keystroke */}
      <span aria-hidden className="absolute inset-0 text-left">
        <span className="text-ink-primary">{typed.slice(0, 8)}</span>
        <span className={`gradient-kit ${typedCount > 8 ? 'ml-3' : ''}`}>{typed.slice(8)}</span>
        <span
          className={`ml-1 font-mono text-neon-cyan ${showPrompt ? '' : 'hidden'}`}
        >
          &gt;<span className="animate-blink">_</span>
        </span>
      </span>
    </h1>
  )
}

function toOrbitTool(
  tool: (typeof allTools)[number],
  i: number,
  accents: string[],
  lang: string
) {
  const Icon = iconMap[tool.icon] ?? Hash
  return {
    href: tool.path,
    name: lang === 'en' ? tool.nameEn : tool.name,
    desc: lang === 'en' ? tool.descriptionEn : tool.description,
    icon: Icon,
    accent: accents[i % accents.length],
    tag: pathToTag(tool.path),
    path: tool.path,
  }
}

export default function HomePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const { t, lang } = useI18n()
  const setPendingData = useTransferStore((s) => s.setPendingData)
  const [pasteCandidates, setPasteCandidates] = useState<DetectedTool[] | null>(null)
  const [pendingContent, setPendingContent] = useState<string>('')

  const handleFileDrop = useCallback((file: File) => {
    const detected = detectByFile(file.name, file.type)

    if (detected?.path === '/tools/image-studio') {
      const reader = new FileReader()
      reader.onload = () => {
        setPendingData({
          content: reader.result as string,
          fileName: file.name,
          mimeType: file.type,
        })
        router.push(detected.path)
      }
      reader.readAsDataURL(file)
      return
    }

    if (detected) {
      const reader = new FileReader()
      reader.onload = () => {
        setPendingData({
          content: reader.result as string,
          fileName: file.name,
          mimeType: file.type,
        })
        router.push(detected.path)
      }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = () => {
        setPendingData({
          content: reader.result as string,
          fileName: file.name,
        })
        router.push('/tools/markdown')
      }
      reader.readAsText(file)
    }
  }, [router, setPendingData])

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const text = e.clipboardData?.getData('text/plain')
    if (!text || !text.trim()) return

    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    const result = detectByContent(text)

    if (Array.isArray(result)) {
      e.preventDefault()
      setPendingContent(text)
      setPasteCandidates(result)
    } else {
      e.preventDefault()
      setPendingData({ content: text })
      router.push(result.path)
    }
  }, [router, setPendingData])

  useEffect(() => {
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const orbitTools = useMemo(
    () => allTools.map((tool, i) => toOrbitTool(tool, i, accentsFor(theme), lang)),
    [theme, lang]
  )

  // Card zoom-then-navigate (click or Enter on a searched card)
  const [zoom, setZoom] = useState<ZoomState | null>(null)
  const activateCard = useCallback(
    (href: string, el: HTMLAnchorElement) => {
      const tool = orbitTools.find((t) => t.href === href)
      if (!tool) {
        router.push(href)
        return
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        router.push(href)
        return
      }
      setZoom({
        href,
        rect: el.getBoundingClientRect(),
        cardW: el.offsetWidth,
        cardH: el.offsetHeight,
        icon: tool.icon,
        name: tool.name,
        desc: tool.desc,
        accent: tool.accent,
      })
      // hide the real card so the overlay reads as the detached original
      el.style.opacity = '0'
      window.setTimeout(() => router.push(href), ZOOM_MS + 40)
    },
    [orbitTools, router]
  )

  const [query, setQuery] = useState('')
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  const matchToolIndex = useCallback(
    (q: string): number | null => {
      const s = q.trim().toLowerCase()
      if (!s) return null
      let best = -1
      let bestScore = 0
      allTools.forEach((tool, i) => {
        const hay = [
          tool.name,
          tool.description,
          tool.path,
          tool.id,
          tool.category,
          ...tool.keywords,
        ]
          .join(' ')
          .toLowerCase()
        let score = 0
        if (hay.includes(s)) score = 3 + s.length / Math.max(hay.length, 1)
        else if (s.split(/\s+/).every((w) => hay.includes(w))) score = 2
        else if (hay.startsWith(s) || tool.name.toLowerCase().startsWith(s)) score = 2.5
        if (score > bestScore) {
          bestScore = score
          best = i
        }
      })
      return bestScore > 0 && best >= 0 ? best : null
    },
    []
  )

  const onQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    setFocusIndex(matchToolIndex(v))
  }

  const onQueryBlur = () => {
    setQuery('')
    setFocusIndex(null)
  }

  const onQueryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && focusIndex !== null && orbitTools[focusIndex]) {
      e.preventDefault()
      // Enter simply replaces the click — synthesize a click on the focused
      // card so it goes through the exact same zoom-then-navigate path.
      // Match by suffix: trailingSlash:true appends '/', and GitHub Pages
      // builds prepend the basePath, so equality never matches there.
      const tool = orbitTools[focusIndex]
      const normalize = (h: string) => (h || '').replace(/\/+$/, '')
      ;[...document.querySelectorAll<HTMLAnchorElement>('.orbit-stage a')]
        .find((a) => normalize(a.getAttribute('href') || '').endsWith(tool.href))
        ?.click()
    }
    if (e.key === 'Escape') {
      onQueryBlur()
      e.currentTarget.blur()
    }
  }

  const handlePasteSelect = useCallback((tool: DetectedTool) => {
    setPendingData({ content: pendingContent })
    setPasteCandidates(null)
    setPendingContent('')
    router.push(tool.path)
  }, [router, setPendingData, pendingContent])

  const handlePasteClose = useCallback(() => {
    setPasteCandidates(null)
    setPendingContent('')
  }, [])

  return (
    <div className="flex min-h-[calc(100dvh-var(--header-total))] flex-col bg-void">
      <DropZone onFileDrop={handleFileDrop} />
      {pasteCandidates && (
        <PasteHint
          candidates={pasteCandidates}
          onSelect={handlePasteSelect}
          onClose={handlePasteClose}
        />
      )}
      {zoom && <CardZoomOverlay zoom={zoom} />}

      {/* Hero + 3D orbit — flex-1 so footer stays on the bottom */}
      {/* overflow-x-hidden only: overflow-y-hidden clips 3D perspective */}
      <section className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 cyber-grid opacity-60 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_25%,transparent_75%)]" />
        <MouseGlow />

        {/* Title — fixed top of hero; chrome above title hides on short viewports */}
        <div className="hero-head relative z-20 mx-auto flex w-full shrink-0 flex-col items-center px-4 pt-4 text-center sm:px-6 sm:pt-8 lg:px-8 [@media(min-height:821px)]:pt-10">
          <div className="mb-3 hidden inline-flex items-center gap-2 rounded-full border border-neon-lime/60 bg-void-100/90 px-3 py-1 [@media(min-height:821px)]:inline-flex">
            <span className="status-dot" />
            <span className="font-mono text-[10px] tracking-wider text-neon-lime">
              SYSTEM ONLINE · 21 MODULES
            </span>
          </div>

          <p className="mb-2 hidden font-mono text-xs tracking-[0.2em] text-ink-muted [@media(min-height:821px)]:block">
            // TOOLKIT FOR DEVELOPERS
          </p>

          <TypingTitle />
        </div>

        {/* Orbit — explicit band height so measurement always works */}
        <div
          className="hero-band relative z-10 w-full px-2"
          style={{ height: 'clamp(260px, 46vh, 680px)' }}
        >
          <ToolOrbit
            tools={orbitTools}
            autoRotateSpeed={0.18}
            focusIndex={focusIndex}
            onCardActivate={activateCard}
            frozen={zoom !== null}
          />
        </div>

        {/* Bottom dock — pinned above footer */}
        <div className="hero-dock relative z-20 mx-auto mt-auto flex w-full shrink-0 flex-col items-center px-4 pb-5 pt-2 text-center sm:px-6 lg:px-8">
          <div
            className={`panel-glow flex w-full max-w-xl items-center gap-3 px-4 py-3 text-left transition-all ${
              focusIndex !== null
                ? 'border-neon-cyan shadow-neon-cyan'
                : 'hover:border-neon-cyan animate-glow-breathe'
            }`}
          >
            <span className="font-mono text-sm text-neon-cyan">&gt;</span>
            <input
              type="text"
              value={query}
              onChange={onQueryChange}
              onBlur={onQueryBlur}
              onKeyDown={onQueryKeyDown}
              placeholder={t('输入工具名、粘贴内容或拖入文件…')}
              aria-label={t('搜索工具')}
              className="flex-1 bg-transparent font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            />
            {focusIndex !== null && orbitTools[focusIndex] ? (
              <span className="shrink-0 font-mono text-[10px] tracking-wider text-neon-lime">
                {orbitTools[focusIndex].name}
              </span>
            ) : (
              <kbd className="flex shrink-0 items-center rounded border border-border-dim bg-void-300 px-1.5 py-1 text-ink-secondary">
                <CornerDownLeft className="h-3.5 w-3.5" />
              </kbd>
            )}
          </div>

          {/* Stats hide on short viewports; input stays */}
          <div className="mt-4 hidden flex-wrap items-center justify-center gap-6 sm:gap-10 [@media(min-height:761px)]:flex">
            {[
              ['21', 'TOOLS', 'text-neon-cyan'],
              ['0ms', 'BOOT', 'text-neon-lime'],
              ['100%', 'LOCAL', 'text-neon-magenta'],
              ['MIT', 'LICENSE', 'text-neon-purple'],
            ].map(([v, l, c]) => (
              <div key={l} className="text-center">
                <div className={`font-display text-lg font-bold sm:text-xl ${c}`}>{v}</div>
                <div className="mt-0.5 font-mono text-[10px] tracking-[0.14em] text-ink-muted">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full shrink-0 border-t border-border-dim bg-void-100">
        <div className="hero-footer flex w-full items-center gap-2.5 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <span className="status-dot" />
          <span className="font-mono text-xs font-medium text-ink-secondary">
            © 2026 DevToolsKit · MIT
          </span>
        </div>
      </footer>
    </div>
  )
}
