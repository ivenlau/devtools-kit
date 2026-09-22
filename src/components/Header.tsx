'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Github, Languages, LayoutGrid, Moon, Sun, X } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/components/I18nProvider'
import { ToolIcon } from '@/components/ToolIcon'
import { tools } from '@/lib/constants/tools'
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

  if (!tabs.length) return null

  const cleanPath = pathname?.replace(/\/+$/, '') ?? ''

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
      className="ml-4 flex min-w-0 flex-1 items-stretch self-stretch overflow-x-auto overflow-y-clip"
      aria-label={t('已打开的工具')}
    >
      {tabs.map((tab) => {
        const tool = tools.find((tl) => tl.path === tab.path)
        if (!tool) return null
        const active = tab.id === activeId
        const name = t(tool.name)
        return (
          <div
            key={tab.id}
            className={`group/tab relative flex shrink-0 items-center gap-0.5 px-2 transition-colors ${
              active ? 'text-neon-cyan' : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            {active && <span aria-hidden className="absolute inset-x-2 bottom-0 h-0.5 bg-neon-cyan" />}
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
