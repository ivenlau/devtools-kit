'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface ToolShellProps {
  title: string
  description: string
  path: string
  icon: LucideIcon
  accent?: string
  children: React.ReactNode
}

const accentMap: Record<string, string> = {
  cyan: 'text-neon-cyan border-neon-cyan shadow-neon-cyan',
  magenta: 'text-neon-magenta border-neon-magenta shadow-neon-magenta',
  lime: 'text-neon-lime border-neon-lime shadow-neon-lime',
  purple: 'text-neon-purple border-neon-purple shadow-neon-purple',
  amber: 'text-neon-amber border-neon-amber',
}

export function ToolShell({
  title,
  description,
  path,
  icon: Icon,
  accent = 'cyan',
  children,
}: ToolShellProps) {
  const accentClass = accentMap[accent] ?? accentMap.cyan

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col bg-void">
      <div className="w-full border-b border-border-dim bg-void-100">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] text-ink-muted">
            <Link href="/" className="hover:text-neon-cyan transition-colors">
              ← HOME
            </Link>
            <span className="text-border-glow">/</span>
            <span className="text-ink-secondary">{path}</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-void-200 ${accentClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold tracking-tight text-ink-primary">
                {title}
              </h1>
              <p className="text-sm text-ink-secondary">{description}</p>
            </div>
            <div className="ml-auto hidden items-center gap-2 rounded-full border border-border-glow bg-void-100 px-3 py-1 sm:flex">
              <span className="status-dot" />
              <span className="font-mono text-[10px] tracking-wider text-neon-lime">LIVE</span>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
