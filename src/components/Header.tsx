'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Hash, Search, X, 
  Braces, FileCode, Clock, Regex, Link2, FileText, Palette, 
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw, 
  Image, Minimize2, Code2, Monitor
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

  // Close search when clicking outside
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
    return <Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
  }

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <Hash className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold font-display hidden sm:inline-block">DevToolsKit</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                pathname === '/' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              首页
            </Link>
            <Link 
              href="/tools" 
              className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                pathname?.startsWith('/tools') ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              工具
            </Link>
            <Link 
              href="/settings" 
              className={`text-sm font-medium transition-colors hover:text-blue-500 ${
                pathname === '/settings' ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              设置
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4" ref={searchRef}>
          <div className="relative">
            <div className={`flex items-center transition-all duration-300 ${
              isSearchOpen ? 'w-64 md:w-80' : 'w-10 md:w-64'
            }`}>
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${
                !isSearchOpen && 'md:block hidden'
              }`}>
                <Search className="h-4 w-4" />
              </div>
              
              {/* Mobile Search Icon Trigger */}
              <button 
                className={`md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isSearchOpen ? 'hidden' : 'block'
                }`}
                onClick={() => {
                  setIsSearchOpen(true)
                  // Focus input after a small delay to allow render
                  setTimeout(() => document.getElementById('tool-search')?.focus(), 50)
                }}
              >
                <Search className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>

              <input
                id="tool-search"
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                className={`w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  isSearchOpen ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'
                }`}
              />
              
              {isSearchOpen && (
                <button 
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {isSearchOpen && (
              <div className="absolute top-full right-0 md:left-0 mt-2 w-72 md:w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-96 overflow-y-auto py-2 z-50">
                {searchResults.length > 0 ? (
                  searchResults.map((tool) => (
                    <button
                      key={tool.id}
                      onClick={() => handleSearchSelect(tool.path)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-3 group"
                    >
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-600 transition-colors">
                        {getIcon(tool.icon)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {tool.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                          {tool.description}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                    未找到相关工具
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
