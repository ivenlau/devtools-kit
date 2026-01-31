'use client'

import { useState, useEffect } from 'react'
import { Settings, Moon, Sun, Globe, Palette, Info } from 'lucide-react'

export default function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [language, setLanguage] = useState('zh-CN')
  const [mounted, setMounted] = useState(false)
  const [showLangTip, setShowLangTip] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved settings
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme('system')
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
    // 显示提示
    if (newLang !== 'zh-CN') {
      setShowLangTip(true)
      setTimeout(() => setShowLangTip(false), 3000)
    }
  }

  if (!mounted) {
    return null // Prevent flash
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">设置</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                个性化您的工具箱体验
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Appearance Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">外观设置</h2>
            </div>

            {/* Theme Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  主题模式
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                    <div className="text-sm font-medium">浅色</div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Moon className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <div className="text-sm font-medium">深色</div>
                  </button>

                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Globe className="h-6 w-6 mx-auto mb-2 text-green-500" />
                    <div className="text-sm font-medium">跟随系统</div>
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                当前选择: {theme === 'light' ? '浅色模式' : theme === 'dark' ? '深色模式' : '跟随系统设置'}
              </p>
            </div>
          </div>

          {/* Language Settings */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-5 w-5 text-green-500" />
              <h2 className="text-lg font-semibold">语言设置</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  界面语言
                </label>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>

              {showLangTip && language !== 'zh-CN' && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    语言切换功能即将推出，当前仅支持简体中文
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-500 dark:text-gray-400">
                更多语言支持正在开发中
              </p>
            </div>
          </div>

          {/* About */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">关于</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">版本</span>
                <span className="font-mono text-gray-900 dark:text-gray-100">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">工具数量</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">21+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">技术栈</span>
                <span className="text-gray-900 dark:text-gray-100">Next.js + React + TypeScript</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                DevToolsKit - 为开发者打造的在线工具箱
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">使用提示</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• 所有工具均在浏览器本地运行，保护您的隐私</li>
              <li>• 设置会自动保存到浏览器本地存储</li>
              <li>• 支持 Windows、macOS、Linux 等主流操作系统</li>
              <li>• 推荐使用 Chrome、Edge、Firefox 等现代浏览器</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
