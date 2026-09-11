'use client'

import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Globe, Palette, Info } from 'lucide-react'
import { ToolShell } from '@/components/ToolShell'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [language, setLanguage] = useState('zh-CN')
  const [mounted, setMounted] = useState(false)
  const [showLangTip, setShowLangTip] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('dark')
    }

    const savedLang = localStorage.getItem('language')
    if (savedLang) {
      setLanguage(savedLang)
    }
  }, [])

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    applyTheme(newTheme)
  }

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    localStorage.setItem('language', newLang)
    if (newLang !== 'zh-CN') {
      setShowLangTip(true)
      setTimeout(() => setShowLangTip(false), 3000)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <ToolShell
      title="SETTINGS"
      description="个性化您的工具箱体验"
      path="/settings"
      icon={Settings}
      accent="lime"
    >
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="panel p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Palette className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-mono text-[11px] tracking-[0.16em] text-neon-cyan">
              APPEARANCE
            </h2>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-ink-secondary mb-3">
              主题模式
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => handleThemeChange('light')}
                className={`rounded-lg border p-4 transition-all ${
                  theme === 'light'
                    ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                    : 'border-border-dim bg-void-200 hover:border-border-glow'
                }`}
              >
                <Sun className="mx-auto mb-2 h-5 w-5 text-neon-amber" />
                <div className="text-sm font-medium text-ink-primary">浅色</div>
              </button>

              <button
                onClick={() => handleThemeChange('dark')}
                className={`rounded-lg border p-4 transition-all ${
                  theme === 'dark'
                    ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                    : 'border-border-dim bg-void-200 hover:border-border-glow'
                }`}
              >
                <Moon className="mx-auto mb-2 h-5 w-5 text-neon-purple" />
                <div className="text-sm font-medium text-ink-primary">深色</div>
              </button>

              <button
                onClick={() => handleThemeChange('system')}
                className={`rounded-lg border p-4 transition-all ${
                  theme === 'system'
                    ? 'border-neon-cyan bg-neon-cyan/10 shadow-neon-cyan'
                    : 'border-border-dim bg-void-200 hover:border-border-glow'
                }`}
              >
                <Globe className="mx-auto mb-2 h-5 w-5 text-neon-lime" />
                <div className="text-sm font-medium text-ink-primary">跟随系统</div>
              </button>
            </div>

            <p className="font-mono text-[11px] text-ink-muted">
              CURRENT · {theme === 'light' ? 'LIGHT' : theme === 'dark' ? 'DARK' : 'SYSTEM'}
            </p>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <Globe className="h-4 w-4 text-neon-lime" />
            <h2 className="font-mono text-[11px] tracking-[0.16em] text-neon-lime">
              LANGUAGE
            </h2>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-ink-secondary">
              界面语言
            </label>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="w-full rounded-md border border-border-glow bg-void-200 px-4 py-3 font-mono text-sm text-ink-primary focus:border-neon-cyan focus:outline-none"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>

            {showLangTip && language !== 'zh-CN' && (
              <div className="flex items-start gap-2 rounded-lg border border-neon-amber/40 bg-neon-amber/10 p-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-neon-amber" />
                <p className="text-xs text-neon-amber">
                  语言切换功能即将推出，当前仅支持简体中文
                </p>
              </div>
            )}

            <p className="text-[11px] text-ink-muted">更多语言支持正在开发中</p>
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="mb-4 font-mono text-[11px] tracking-[0.16em] text-ink-secondary">
            ABOUT
          </h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-muted">版本</span>
              <span className="font-mono text-ink-primary">v2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">工具数量</span>
              <span className="font-mono text-neon-cyan">21+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-muted">技术栈</span>
              <span className="text-ink-primary">Next.js + React + TypeScript</span>
            </div>
          </div>
          <div className="mt-5 border-t border-border-dim pt-4 text-center">
            <p className="font-mono text-[11px] text-ink-muted">
              DevToolsKit · cyber terminal for hackers
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-neon-cyan/30 bg-neon-cyan/5 p-4">
          <h4 className="mb-2 font-mono text-[11px] tracking-wider text-neon-cyan">TIPS</h4>
          <ul className="space-y-1 text-[11px] text-ink-secondary">
            <li>• 所有工具均在浏览器本地运行，保护您的隐私</li>
            <li>• 设置会自动保存到浏览器本地存储</li>
            <li>• 支持 Windows、macOS、Linux 等主流操作系统</li>
            <li>• 推荐使用 Chrome、Edge、Firefox 等现代浏览器</li>
          </ul>
        </div>
      </div>
    </ToolShell>
  )
}
