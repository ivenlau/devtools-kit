'use client'

import { useState, useEffect } from 'react'
import { Monitor, Copy, Smartphone, Tablet, Globe } from 'lucide-react'
import { UAParser } from 'ua-parser-js'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

interface ParsedUA {
  browser: { name: string; version: string }
  os: { name: string; version: string }
  device: { type: string; vendor: string; model: string }
  engine: { name: string; version: string }
}

export default function UserAgentPage() {
  const { t, lang } = useI18n()
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
    if (!parsed) return <Monitor className="h-4 w-4" />

    const type = parsed.device.type?.toLowerCase()
    if (type === 'mobile') return <Smartphone className="h-4 w-4" />
    if (type === 'tablet') return <Tablet className="h-4 w-4" />
    return <Monitor className="h-4 w-4" />
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
      description={t('解析浏览器和设备信息')}
      path="/tools/useragent"
      icon={Monitor}
      accent="cyan"
      actions={
        <>
          {myUA && (
            <button onClick={useMyUA} className="tool-btn">
              <Globe className="h-3.5 w-3.5" />
              {t('本机')} UA
            </button>
          )}
          {input && (
            <button onClick={() => copyToClipboard(input)} className="tool-btn tool-btn-icon" title={t('复制')} aria-label={t('复制')}>
              <Copy className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Input */}
        <div className="tool-panel">
          <div className="tool-panel-head">
            <span className="text-neon-cyan">&gt;_</span>
            <span>USER-AGENT</span>
            <span className="ml-auto normal-case tracking-normal">{input.length} {t('字符')}</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('粘贴 User-Agent 字符串...')}
            spellCheck={false}
            className="h-36 w-full resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-cyan placeholder:text-ink-muted focus:outline-none"
          />
        </div>

        {/* Parsed Result */}
        {parsed && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {/* Browser */}
            <div className="rounded-lg border border-border-dim bg-void-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-dim bg-void-200">
                  <Globe className="h-4 w-4 text-neon-cyan" />
                </div>
                <h4 className="font-mono text-xs text-ink-secondary">{t('浏览器')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('名称')}</span>
                  <span className="font-semibold text-ink-primary">{parsed.browser.name}</span>
                </div>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('版本')}</span>
                  <span className="font-mono text-ink-primary">{parsed.browser.version}</span>
                </div>
              </div>
            </div>

            {/* OS */}
            <div className="rounded-lg border border-border-dim bg-void-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-dim bg-void-200">
                  <Monitor className="h-4 w-4 text-neon-cyan" />
                </div>
                <h4 className="font-mono text-xs text-ink-secondary">{t('操作系统')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('名称')}</span>
                  <span className="font-semibold text-ink-primary">{parsed.os.name}</span>
                </div>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('版本')}</span>
                  <span className="font-mono text-ink-primary">{parsed.os.version}</span>
                </div>
              </div>
            </div>

            {/* Device */}
            <div className="rounded-lg border border-border-dim bg-void-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-dim bg-void-200">
                  {getDeviceIcon()}
                </div>
                <h4 className="font-mono text-xs text-ink-secondary">{t('设备')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('类型')}</span>
                  <span className="font-semibold capitalize text-ink-primary">
                    {parsed.device.type}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('厂商')}</span>
                  <span className="text-ink-primary">{parsed.device.vendor}</span>
                </div>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('型号')}</span>
                  <span className="text-ink-primary">{parsed.device.model}</span>
                </div>
              </div>
            </div>

            {/* Engine */}
            <div className="rounded-lg border border-border-dim bg-void-100 p-4">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border-dim bg-void-200">
                  <Monitor className="h-4 w-4 text-neon-cyan" />
                </div>
                <h4 className="font-mono text-xs text-ink-secondary">{t('渲染引擎')}</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('名称')}</span>
                  <span className="font-semibold text-ink-primary">{parsed.engine.name}</span>
                </div>
                <div className="flex justify-between gap-3 text-xs">
                  <span className="text-ink-muted">{t('版本')}</span>
                  <span className="font-mono text-ink-primary">{parsed.engine.version}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Examples */}
        <div className="rounded-lg border border-border-dim bg-void-100 p-4">
          <h3 className="mb-3 font-mono text-[11px] text-ink-muted">{t('常用 User-Agent')}</h3>

          <div className="space-y-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setInput(example.ua)}
                className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left transition-colors hover:border-neon-cyan"
              >
                <div className="mb-1 text-xs font-semibold text-ink-primary">{example.name}</div>
                <div className="truncate font-mono text-[11px] text-ink-muted">{example.ua}</div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
