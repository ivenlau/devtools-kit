'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Hash, Search, X,
  Braces, FileCode, Clock, Regex, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor, Github
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { tools } from '@/lib/constants/tools'

const iconMap: Record<string, any> = {
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(tools)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const filtered = tools.filter(tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    setSearchResults(filtered)
  }, [searchQuery])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSelect = (path: string) => {
    router.push(path)
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const getIcon = (iconName: string) => {
    const Icon = iconMap[iconName] || Hash
    return <Icon className="h-4 w-4 text-neon-cyan" />
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-dim bg-void-100/90 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between px-4 sm:px-6 lg:px-8">
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
            <span className="font-mono text-[10px] text-neon-lime">v2</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className={`font-mono text-[11px] tracking-[0.12em] transition-colors ${
                pathname === '/'
                  ? 'text-neon-cyan neon-text-cyan'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              HOME
            </Link>
            <Link
              href="/tools"
              className={`font-mono text-[11px] tracking-[0.12em] transition-colors ${
                pathname?.startsWith('/tools')
                  ? 'text-neon-cyan neon-text-cyan'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              TOOLS
            </Link>
            <Link
              href="/settings"
              className={`font-mono text-[11px] tracking-[0.12em] transition-colors ${
                pathname === '/settings'
                  ? 'text-neon-cyan neon-text-cyan'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              SETTINGS
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2" ref={searchRef}>
          <div className="relative">
            <div className={`flex items-center transition-all duration-300 ${
              isSearchOpen ? 'w-64 md:w-80' : 'w-10 md:w-64'
            }`}>
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted ${
                !isSearchOpen && 'md:block hidden'
              }`}>
                <Search className="h-4 w-4" />
              </div>

              <button
                className={`md:hidden p-2 rounded-md hover:bg-void-200 ${
                  isSearchOpen ? 'hidden' : 'block'
                }`}
                onClick={() => {
                  setIsSearchOpen(true)
                  setTimeout(() => document.getElementById('tool-search')?.focus(), 50)
                }}
              >
                <Search className="h-5 w-5 text-ink-secondary" />
              </button>

              <input
                id="tool-search"
                type="text"
                placeholder="search tools…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className={`w-full rounded-md border border-border-dim bg-void-200 py-2 pl-10 pr-4 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none focus:ring-1 focus:ring-neon-cyan/40 transition-all ${
                  isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'
                }`}
              />

              {isSearchOpen && (
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {isSearchOpen && (
              <div className="absolute top-full right-0 md:left-0 mt-2 w-72 md:w-full overflow-hidden rounded-lg border border-border-glow bg-void-100 shadow-panel py-1.5 z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSearchSelect(tool.path)}
                      className="w-full text-left px-3 py-2.5 hover:bg-void-200 flex items-center gap-3 group transition-colors"
                    >
                      <div className="p-1.5 rounded-md bg-void-200 border border-border-dim group-hover:border-neon-cyan/50 transition-colors">
                        {getIcon(tool.icon)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink-primary truncate">
                          {tool.name}
                        </div>
                        <div className="font-mono text-[11px] text-ink-muted truncate">
                          {tool.description}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center font-mono text-xs text-ink-muted">
                    NO MATCH
                  </div>
                )}
              </div>
            )}
          </div>

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
