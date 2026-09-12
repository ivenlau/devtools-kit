'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wrench, Search, X,
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor,
} from 'lucide-react'
import { tools } from '@/lib/constants/tools'
import { ToolShell } from '@/components/ToolShell'

const iconMap: Record<string, any> = {
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor,
}

const accents = ['#00E5FF', '#B8FF3C', '#A855F7', '#FFB020', '#FF2D95', '#FF79C6']

export default function ToolsPage() {
  const [query, setQuery] = useState('')

  const filtered = query
    ? tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase()) ||
          tool.description.toLowerCase().includes(query.toLowerCase()) ||
          tool.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : tools

  return (
    <ToolShell
      title="TOOLS"
      description={`${filtered.length} / ${tools.length} 实用工具 · 本地运行 · 零安装`}
      path="/tools"
      icon={Wrench}
      accent="cyan"
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            id="tool-search"
            type="text"
            placeholder="search tools…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-40 rounded-md border border-border-dim bg-void-200 py-1.5 pl-8 pr-7 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 sm:w-56"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="清空搜索"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      }
    >
      <main className="w-full py-5">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tool, i) => {
              const Icon = iconMap[tool.icon] || Hash
              const accent = accents[i % accents.length]
              return (
                <Link
                  key={tool.id}
                  href={tool.path}
                  className="tool-card animate-fade-up"
                  style={{ '--accent': accent, animationDelay: `${i * 30}ms` } as React.CSSProperties}
                >
                  <div className="relative z-10">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border bg-void-200"
                      style={{
                        borderColor: accent,
                        color: accent,
                        boxShadow: `0 0 12px ${accent}33`,
                      }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink-primary">
                      {tool.name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-snug text-ink-secondary">
                      {tool.description}
                    </p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-ink-muted">{tool.path}</span>
                      <span className="font-mono text-[10px] tracking-wider" style={{ color: accent }}>
                        OPEN →
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-24 text-center">
            <Search className="h-8 w-8 text-ink-muted" />
            <p className="font-mono text-sm text-ink-secondary">NO MATCH</p>
            <p className="text-xs text-ink-muted">没有匹配「{query}」的工具，试试其他关键词</p>
          </div>
        )}
      </main>
    </ToolShell>
  )
}
