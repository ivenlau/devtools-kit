'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Wrench, Search, X } from 'lucide-react'
import { tools } from '@/lib/constants/tools'
import { accentsFor } from '@/lib/constants/accents'
import { ToolShell } from '@/components/ToolShell'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/components/I18nProvider'
import { ToolIcon } from '@/components/ToolIcon'

export default function ToolsPage() {
  const [query, setQuery] = useState('')
  const { t, lang } = useI18n()
  const { theme } = useTheme()

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
      description={`${filtered.length} / ${tools.length} ${t('实用工具')} · ${t('本地运行 · 零安装')}`}
      path="/tools"
      icon={Wrench}
      accent="cyan"
      actions={
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            id="tool-search"
            type="text"
            placeholder={t('搜索工具…')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-40 rounded-md border border-border-dim bg-void-200 py-1.5 pl-8 pr-7 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 sm:w-56"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label={t('清空搜索')}
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
              const accents = accentsFor(theme)
              const accent = accents[i % accents.length]
              const name = lang === 'en' ? tool.nameEn : tool.name
              const description = lang === 'en' ? tool.descriptionEn : tool.description
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
                      <ToolIcon name={tool.icon} className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold text-ink-primary">
                      {name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-snug text-ink-secondary">
                      {description}
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
            <p className="text-xs text-ink-muted">{t('没有匹配的工具，试试其他关键词')}</p>
          </div>
        )}
      </main>
    </ToolShell>
  )
}
