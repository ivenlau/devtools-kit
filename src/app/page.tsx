'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Braces, FileCode, Hash, Clock, Link2, Regex, FileText, Palette,
  Binary, Shield, Database, ArrowLeftRight, QrCode, Terminal, Globe,
  RefreshCw, Image as ImageIcon, Minimize2, Code2, Monitor
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useTransferStore } from '@/stores/transferStore'
import { detectByFile, detectByContent, DetectedTool } from '@/lib/detectTool'
import { tools as allTools } from '@/lib/constants/tools'
import { DropZone } from '@/components/DropZone'
import { PasteHint } from '@/components/PasteHint'
import { MouseGlow } from '@/components/MouseGlow'
import { ToolOrbit } from '@/components/ToolOrbit'

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

const accents = [
  '#00E5FF',
  '#B8FF3C',
  '#A855F7',
  '#FFB020',
  '#FF2D95',
  '#FF79C6',
]

function pathToTag(path: string): string {
  if (path === '/tools/regex' || path === '/tools/json') return 'HOT'
  if (path === '/tools/jwt' || path === '/tools/cron') return 'NEW'
  return 'P0'
}

function toOrbitTool(t: (typeof allTools)[number], i: number) {
  const Icon = iconMap[t.icon] ?? Hash
  return {
    href: t.path,
    name: t.name,
    desc: t.description,
    icon: Icon,
    accent: accents[i % accents.length],
    tag: pathToTag(t.path),
    path: t.path,
  }
}

export default function HomePage() {
  const router = useRouter()
  const setPendingData = useTransferStore((s) => s.setPendingData)
  const [pasteCandidates, setPasteCandidates] = useState<DetectedTool[] | null>(null)
  const [pendingContent, setPendingContent] = useState<string>('')

  const handleFileDrop = useCallback((file: File) => {
    const detected = detectByFile(file.name, file.type)

    if (detected?.path === '/tools/image-compress') {
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

  const orbitTools = useMemo(() => allTools.map(toOrbitTool), [])

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
      router.push(orbitTools[focusIndex].href)
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
    <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col bg-void">
      <DropZone onFileDrop={handleFileDrop} />
      {pasteCandidates && (
        <PasteHint
          candidates={pasteCandidates}
          onSelect={handlePasteSelect}
          onClose={handlePasteClose}
        />
      )}

      {/* Hero + 3D orbit — flex-1 so footer stays on the bottom */}
      {/* overflow-x-hidden only: overflow-y-hidden clips 3D perspective */}
      <section className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 cyber-grid opacity-60 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_45%,#000_25%,transparent_75%)]" />
        <MouseGlow />

        {/* Title — fixed top of hero; chrome above title hides on short viewports */}
        <div className="relative z-20 mx-auto flex w-full shrink-0 flex-col items-center px-4 pt-4 text-center sm:px-6 sm:pt-8 lg:px-8 [@media(min-height:821px)]:pt-10">
          <div className="mb-3 hidden inline-flex items-center gap-2 rounded-full border border-neon-lime/60 bg-void-100/90 px-3 py-1 [@media(min-height:821px)]:inline-flex">
            <span className="status-dot" />
            <span className="font-mono text-[10px] tracking-wider text-neon-lime">
              SYSTEM ONLINE · 21 MODULES
            </span>
          </div>

          <p className="mb-2 hidden font-mono text-xs tracking-[0.2em] text-ink-muted [@media(min-height:821px)]:block">
            // TOOLKIT FOR DEVELOPERS
          </p>

          <h1 className="font-display text-4xl font-bold leading-none tracking-tight sm:text-5xl md:text-6xl">
            <span className="text-ink-primary">DEVTOOLS</span>
            <span className="gradient-kit ml-3">KIT</span>
            <span className="ml-1 font-mono text-neon-cyan animate-blink">&gt;_</span>
          </h1>
        </div>

        {/* Orbit — explicit band height so measurement always works */}
        <div
          className="relative z-10 w-full px-2"
          style={{ height: 'clamp(260px, 46vh, 680px)' }}
        >
          <ToolOrbit
            tools={orbitTools}
            autoRotateSpeed={0.18}
            focusIndex={focusIndex}
          />
        </div>

        {/* Bottom dock — pinned above footer */}
        <div className="relative z-20 mx-auto mt-auto flex w-full shrink-0 flex-col items-center px-4 pb-5 pt-2 text-center sm:px-6 lg:px-8">
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
              placeholder="输入工具名、粘贴内容或拖入文件…"
              aria-label="搜索工具"
              className="flex-1 bg-transparent font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            />
            {focusIndex !== null && orbitTools[focusIndex] ? (
              <span className="shrink-0 font-mono text-[10px] tracking-wider text-neon-lime">
                {orbitTools[focusIndex].name}
              </span>
            ) : (
              <kbd className="shrink-0 rounded border border-border-dim bg-void-300 px-2 py-0.5 font-mono text-[10px] text-ink-secondary">
                ⌘K
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
        <div className="flex w-full items-center gap-2.5 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <span className="status-dot" />
          <span className="font-mono text-[11px] text-ink-muted">
            © 2025 DevToolsKit · MIT · ivenlau@qq.com
          </span>
        </div>
      </footer>
    </div>
  )
}
