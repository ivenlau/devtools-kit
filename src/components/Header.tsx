'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Github, Languages, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/components/I18nProvider'

const NAV_LINKS = [
  { href: '/', label: '首页' },
  { href: '/tools', label: '工具箱' },
]

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { lang, setLang, t } = useI18n()

  return (
    <header className="sticky top-0 z-50 bg-void-100/90 backdrop-blur-md">
      {/* border lives on the inner box so the header totals exactly h-14 (3.5rem) — pages below use calc(100dvh - 3.5rem) */}
      <div className="flex h-14 w-full items-center justify-between border-b border-border-dim px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              aria-hidden
              className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-neon-cyan to-neon-magenta font-mono text-[11px] font-bold leading-none text-white shadow-neon-cyan transition-shadow group-hover:shadow-neon-magenta"
            >
              &gt;_
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink-primary">
              DevToolsKit
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-mono text-[11px] tracking-[0.12em] transition-colors ${
                  pathname === href || (href === '/tools' && pathname?.startsWith('/tools'))
                    ? 'text-neon-cyan neon-text-cyan'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                {t(label)}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
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
