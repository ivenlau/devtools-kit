'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface ToolShellProps {
  title: string
  description: string
  path: string
  icon: LucideIcon
  accent?: string
  /** Compact action buttons rendered at the right edge of the header row. */
  actions?: React.ReactNode
  children: React.ReactNode
}

const accentMap: Record<string, { box: string; line: string; raw: string }> = {
  cyan: {
    box: 'text-neon-cyan',
    line: 'via-neon-cyan/60',
    raw: '#00E5FF',
  },
  magenta: {
    box: 'text-neon-magenta',
    line: 'via-neon-magenta/60',
    raw: '#FF2D95',
  },
  lime: {
    box: 'text-neon-lime',
    line: 'via-neon-lime/60',
    raw: '#B8FF3C',
  },
  purple: {
    box: 'text-neon-purple',
    line: 'via-neon-purple/60',
    raw: '#A855F7',
  },
  amber: {
    box: 'text-neon-amber',
    line: 'via-neon-amber/60',
    raw: '#FFB020',
  },
}

export function ToolShell({
  title,
  description,
  icon: Icon,
  accent = 'cyan',
  actions,
  children,
}: ToolShellProps) {
  const a = accentMap[accent] ?? accentMap.cyan

  return (
    <div
      className="flex min-h-[calc(100dvh-3.5rem)] w-full flex-col bg-void"
      style={{ '--accent': a.raw } as React.CSSProperties}
    >
      {/* Single compact strip: back · path · icon · title · description · actions */}
      <div className="relative w-full border-b border-border-dim bg-void-100">
        <div className="flex min-h-11 w-full flex-wrap items-center gap-x-2.5 gap-y-1.5 px-4 py-2 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="返回主页"
            className="font-mono text-[11px] text-ink-muted transition-colors hover:text-neon-cyan"
          >
            ←
          </Link>
          <Icon className={`ml-1 h-4 w-4 shrink-0 ${a.box}`} />
          <h1 className="font-display text-base font-bold tracking-tight text-ink-primary">
            {title}
          </h1>
          <span className="hidden min-w-0 truncate font-mono text-[11px] text-ink-muted lg:inline">
            {description}
          </span>
          {actions && (
            <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>
          )}
        </div>
        {/* accent hairline — echoes the homepage neon accents */}
        <div
          aria-hidden
          className={`h-px w-full bg-gradient-to-r from-transparent ${a.line} to-transparent`}
        />
      </div>
      <div className="flex w-full flex-1 flex-col px-4 py-3 sm:px-6 lg:px-8">{children}</div>
    </div>
  )
}
