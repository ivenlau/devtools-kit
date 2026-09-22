'use client'

import type { LucideIcon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { tools } from '@/lib/constants/tools'

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

const accentMap: Record<string, { box: string; line: string; dark: string; light: string }> = {
  pink: {
    box: 'text-neon-pink',
    line: 'via-neon-pink/60',
    dark: '#FF79C6',
    light: '#B0308C',
  },
  cyan: {
    box: 'text-neon-cyan',
    line: 'via-neon-cyan/60',
    dark: '#00E5FF',
    light: '#0084AD',
  },
  magenta: {
    box: 'text-neon-magenta',
    line: 'via-neon-magenta/60',
    dark: '#FF2D95',
    light: '#C81E6E',
  },
  lime: {
    box: 'text-neon-lime',
    line: 'via-neon-lime/60',
    dark: '#B8FF3C',
    light: '#549000',
  },
  purple: {
    box: 'text-neon-purple',
    line: 'via-neon-purple/60',
    dark: '#A855F7',
    light: '#7C3AED',
  },
  amber: {
    box: 'text-neon-amber',
    line: 'via-neon-amber/60',
    dark: '#FFB020',
    light: '#A16A00',
  },
}

export function ToolShell({
  title,
  description,
  path,
  icon: Icon,
  accent = 'cyan',
  actions,
  children,
}: ToolShellProps) {
  const { theme } = useTheme()
  // The card color on the home orbit is the source of truth — derive the
  // page accent from the tool registry so navigation between card and page
  // keeps the same hue (explicit prop is only a fallback).
  const accentName = tools.find((tool) => tool.path === path)?.accent ?? accent
  const a = accentMap[accentName] ?? accentMap.cyan

  return (
    <div
      className="flex min-h-[calc(100dvh-var(--header-total))] w-full flex-col bg-void"
      style={{ '--accent': theme === 'light' ? a.light : a.dark } as React.CSSProperties}
    >
      {/* Single compact strip: path · icon · title · description · actions */}
      <div className="relative w-full border-b border-border-dim bg-void-100">
        <div className="flex min-h-11 w-full flex-wrap items-center gap-x-2.5 gap-y-1.5 px-4 py-2 sm:px-6 lg:px-8">
          <Icon className={`h-4 w-4 shrink-0 ${a.box}`} />
          <h1
            className="font-display text-base font-bold tracking-tight text-ink-primary"
            title={description}
          >
            {title}
          </h1>
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
