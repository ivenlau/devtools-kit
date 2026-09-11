'use client'

import { useState, useEffect } from 'react'
import { Monitor, Copy, Smartphone, Tablet, Globe } from 'lucide-react'
import { UAParser } from 'ua-parser-js'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

interface ParsedUA {
  browser: { name: string; version: string }
  os: { name: string; version: string }
  device: { type: string; vendor: string; model: string }
  engine: { name: string; version: string }
}

export default function UserAgentPage() {
  const [input, setInput] = useState('')
  const [parsed, setParsed] = useState<ParsedUA | null>(null)
  const [myUA, setMyUA] = useState('')

  useTransferData(setInput)

  // Get user's own UA
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMyUA(navigator.userAgent)
    }
  }, [])

  // Parse User Agent
  useEffect(() => {
    if (!input.trim()) {
      setParsed(null)
      return
    }

    try {
      const ua = UAParser(input)
      setParsed({
        browser: {
          name: ua.browser.name || 'Unknown',
          version: ua.browser.version || 'Unknown',
        },
        os: {
          name: ua.os.name || 'Unknown',
          version: ua.os.version || 'Unknown',
        },
        device: {
          type: ua.device.type || 'Desktop',
          vendor: ua.device.vendor || 'Unknown',
          model: ua.device.model || 'Unknown',
        },
        engine: {
          name: ua.engine.name || 'Unknown',
          version: ua.engine.version || 'Unknown',
        },
      })
    } catch (error) {
      console.error('Parse error:', error)
    }
  }, [input])

  // Use my UA
  const useMyUA = () => {
    setInput(myUA)
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Get device icon
  const getDeviceIcon = () => {
    if (!parsed) return <Monitor className="h-5 w-5" />

    const type = parsed.device.type?.toLowerCase()
    if (type === 'mobile') return <Smartphone className="h-5 w-5" />
    if (type === 'tablet') return <Tablet className="h-5 w-5" />
    return <Monitor className="h-5 w-5" />
  }

  // Example User Agents
  const examples = [
    {
      name: 'Chrome on Windows',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    {
      name: 'Safari on iPhone',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    },
    {
      name: 'Firefox on macOS',
      ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
    },
    {
      name: 'Edge on Android',
      ua: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 EdgA/120.0.0.0',
    },
  ]

  return (
    <ToolShell
      title="USER-AGENT"
      description="解析浏览器和设备信息"
      path="/tools/useragent"
      icon={Monitor}
      accent="cyan"
    >

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Input */}
          <div className="panel p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-ink-secondary mb-2">
                  User-Agent 字符串
                </label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="粘贴 User-Agent 字符串..."
                  className="w-full h-32 p-4 font-mono text-xs border border-border-dim rounded-lg bg-void-200 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  spellCheck={false}
                />
              </div>

              {/* My UA Button */}
              {myUA && (
                <button
                  onClick={useMyUA}
                  className="w-full p-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-ink-secondary mb-1">当前浏览器</div>
                      <div className="font-mono text-xs text-gray-900 dark:text-gray-100 truncate">
                        {myUA}
                      </div>
                    </div>
                    <Globe className="h-5 w-5 text-cyan-500" />
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Parsed Result */}
          {parsed && (
            <div className="panel p-6">
              <h3 className="text-sm font-semibold mb-4">解析结果</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Browser */}
                <div className="p-4 bg-void-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    <h4 className="text-sm font-semibold">浏览器</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">名称</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{parsed.browser.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">版本</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{parsed.browser.version}</span>
                    </div>
                  </div>
                </div>

                {/* OS */}
                <div className="p-4 bg-void-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-green-500" />
                    </div>
                    <h4 className="text-sm font-semibold">操作系统</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">名称</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{parsed.os.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">版本</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{parsed.os.version}</span>
                    </div>
                  </div>
                </div>

                {/* Device */}
                <div className="p-4 bg-void-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                      {getDeviceIcon()}
                    </div>
                    <h4 className="text-sm font-semibold">设备</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">类型</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100 capitalize">{parsed.device.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">厂商</span>
                      <span className="text-gray-900 dark:text-gray-100">{parsed.device.vendor}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">型号</span>
                      <span className="text-gray-900 dark:text-gray-100">{parsed.device.model}</span>
                    </div>
                  </div>
                </div>

                {/* Engine */}
                <div className="p-4 bg-void-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-orange-500" />
                    </div>
                    <h4 className="text-sm font-semibold">渲染引擎</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">名称</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{parsed.engine.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-secondary">版本</span>
                      <span className="font-mono text-gray-900 dark:text-gray-100">{parsed.engine.version}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Examples */}
          <div className="panel p-6">
            <h3 className="text-sm font-semibold mb-4">常用 User-Agent</h3>

            <div className="space-y-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setInput(example.ua)}
                  className="w-full p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                >
                  <div className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {example.name}
                  </div>
                  <div className="font-mono text-xs text-ink-secondary truncate">
                    {example.ua}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-cyan-800 dark:text-cyan-300 mb-2">使用提示</h4>
            <ul className="text-xs text-cyan-700 dark:text-cyan-400 space-y-1">
              <li>• User-Agent 是浏览器发送给服务器的标识字符串</li>
              <li>• 可以从中提取浏览器、操作系统、设备类型等信息</li>
              <li>• 常用于统计分析、兼容性检测、爬虫模拟等场景</li>
              <li>• 点击"当前浏览器"可快速获取您当前的 UA</li>
            </ul>
          </div>
        </div>
      </div>

    </ToolShell>
  )
}
