'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Github, Languages, LayoutGrid, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/components/I18nProvider'
import { ToolIcon } from '@/components/ToolIcon'
import { tools } from '@/lib/constants/tools'
import { ACCENT_MAP } from '@/lib/constants/accents'
import { useTabStore } from '@/stores/tabStore'

/** Dynamic tool tabs — live in the header next to the logo, cyan theme. */
function TabStrip() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const tabs = useTabStore((s) => s.tabs)
  const activeId = useTabStore((s) => s.activeId)
  const beginSwitch = useTabStore((s) => s.beginSwitch)
  const clearSwitchIntent = useTabStore((s) => s.clearSwitchIntent)
  const closeTab = useTabStore((s) => s.closeTab)
  const moveTab = useTabStore((s) => s.moveTab)

  const cleanPath = pathname?.replace(/\/+$/, '') ?? ''
  // a tab reads as active only while its page is actually on screen —
  // navigating home / to the toolbox index must clear the highlight
  const effectiveActiveId =
    tabs.find((tl) => tl.id === activeId && tl.path === cleanPath)?.id ?? null

  // native scrollbar is hidden; edge arrows appear only when tabs overflow
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateArrows = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 1)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [updateArrows, tabs.length])

  // browser-style: bring the highlighted tab into view when it changes
  useEffect(() => {
    if (!effectiveActiveId) return
    scrollRef.current
      ?.querySelector(`[data-tab-id="${effectiveActiveId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }, [effectiveActiveId])

  // drag & drop reordering — tabs shift live as the pointer crosses a tab's
  // midpoint (the same threshold rule browsers use, keeps it flicker-free)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragIdRef = useRef<string | null>(null)

  if (!tabs.length) return null

  const close = (id: string) => {
    const closed = tabs.find((tl) => tl.id === id)
    const remaining = closeTab(id)
    if (closed?.path !== cleanPath) return // inactive tab: no navigation happens
    const nowActive = remaining.find((tl) => tl.id === useTabStore.getState().activeId)
    if (!nowActive) {
      router.replace('/tools/')
      return
    }
    if (nowActive.path !== cleanPath) {
      // auto-navigation to the neighbor must read as a switch, not an open —
      // otherwise the route handler spawns a duplicate of the neighbor
      beginSwitch(nowActive.id)
      router.replace(nowActive.path)
    } else {
      clearSwitchIntent() // same URL: no route effect will consume it
    }
  }

  return (
    <div
      className="relative ml-4 flex min-w-0 flex-1 items-stretch self-stretch"
      aria-label={t('已打开的工具')}
    >
      {canScrollLeft && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
          aria-label={t('向左滚动')}
          title={t('向左滚动')}
          className="absolute left-0 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-border-dim bg-void-200/95 text-ink-secondary transition-colors hover:border-neon-cyan hover:text-neon-cyan"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      )}
      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="flex min-w-0 flex-1 items-stretch overflow-x-auto overflow-y-clip [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((tab) => {
          const tool = tools.find((tl) => tl.path === tab.path)
          if (!tool) return null
          const active = tab.id === effectiveActiveId
          const name = t(tool.name)
          // active tab picks up the tool's own accent hue (text + underline),
          // echoing the gradient hairline inside the tool page
          const accent = active ? (ACCENT_MAP[tool.accent] ?? ACCENT_MAP.cyan) : null
          return (
            <div
              key={tab.id}
              data-tab-id={tab.id}
              draggable
              onDragStart={(e) => {
                dragIdRef.current = tab.id
                setDraggingId(tab.id)
                e.dataTransfer.effectAllowed = 'move'
                e.dataTransfer.setData('text/plain', tab.id)
              }}
              onDragEnd={() => {
                dragIdRef.current = null
                setDraggingId(null)
              }}
              onDragOver={(e) => {
                const dragId = dragIdRef.current
                if (!dragId || dragId === tab.id) return
                e.preventDefault()
                e.dataTransfer.dropEffect = 'move'
                // only swap once the pointer crosses this tab's midpoint
                const rect = e.currentTarget.getBoundingClientRect()
                const after = e.clientX > rect.left + rect.width / 2
                const ids = tabs.map((tl) => tl.id)
                const from = ids.indexOf(dragId)
                let to = ids.indexOf(tab.id) + (after ? 1 : 0)
                if (from < to) to -= 1
                if (to !== from) moveTab(dragId, to)
              }}
              onDrop={(e) => e.preventDefault()}
              className={`group/tab relative flex shrink-0 cursor-grab items-center gap-0.5 px-2 transition-colors active:cursor-grabbing ${
                accent ? accent.box : 'text-ink-secondary hover:text-ink-primary'
              } ${draggingId === tab.id ? 'opacity-40' : ''}`}
            >
              {accent && (
                <span aria-hidden className={`absolute inset-x-2 bottom-0 h-0.5 ${accent.tab}`} />
              )}
              <button
                onClick={() => {
                  beginSwitch(tab.id)
                  if (tab.path !== cleanPath) router.replace(tab.path)
                  else clearSwitchIntent() // same URL: no route effect will consume it
                }}
                title={name}
                aria-label={name}
                aria-current={active ? 'page' : undefined}
                className="flex h-full cursor-pointer items-center gap-1.5"
              >
                <ToolIcon name={tool.icon} className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.12em]">{name}</span>
              </button>
              <button
                onClick={() => close(tab.id)}
                title={t('关闭')}
                aria-label={`${t('关闭')} ${name}`}
                className={`flex cursor-pointer items-center transition-opacity hover:text-neon-magenta ${
                  active ? 'opacity-100' : 'opacity-0 group-hover/tab:opacity-100 focus-visible:opacity-100'
                }`}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )
        })}
      </div>
      {canScrollRight && (
        <button
          onClick={() => scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
          aria-label={t('向右滚动')}
          title={t('向右滚动')}
          className="absolute right-0 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-border-dim bg-void-200/95 text-ink-secondary transition-colors hover:border-neon-cyan hover:text-neon-cyan"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t } = useI18n()

  const onToolsIndex = pathname?.replace(/\/+$/, '') === '/tools'

  return (
    <header className="sticky top-0 z-50 bg-void-100/90 backdrop-blur-md">
      {/* border lives on the inner box so the header totals exactly h-14 (3.5rem) — pages below use calc(100dvh - var(--header-total)) */}
      <div className="flex h-14 w-full items-center justify-between gap-4 border-b border-border-dim px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center">
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-neon-cyan to-neon-magenta font-mono text-[11px] font-bold leading-none text-white shadow-neon-cyan transition-shadow group-hover:shadow-neon-magenta"
            >
              &gt;_
            </span>
            <span className="hidden font-display text-lg font-bold tracking-tight text-ink-primary sm:inline">
              DevToolsKit
            </span>
          </Link>

          <TabStrip />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/tools/"
            aria-label={t('工具箱')}
            title={t('工具箱')}
            className={`flex h-9 w-9 items-center justify-center rounded-md border transition-all ${
              onToolsIndex
                ? 'border-neon-cyan text-neon-cyan shadow-neon-cyan'
                : 'border-border-dim bg-void-200 text-ink-secondary hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            aria-label={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-dim bg-void-200 text-ink-secondary transition-all hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan"
          >
            <Languages className="h-4 w-4" />
          </button>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-dim bg-void-200 text-ink-secondary transition-all hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href="https://github.com/ivenlau/devtools-kit"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border-dim bg-void-200 text-ink-secondary transition-all hover:border-neon-cyan hover:text-neon-cyan hover:shadow-neon-cyan"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>
    </header>
  )
}
