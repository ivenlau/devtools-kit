'use client'

import { useState, useEffect } from 'react'
import { Terminal, Copy, Trash2 } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

export default function CurlGeneratorPage() {
  const { t, lang } = useI18n()
  const [url, setUrl] = useState('https://api.example.com/users')
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET')
  const [headers, setHeaders] = useState([{ key: 'Content-Type', value: 'application/json' }])
  const [body, setBody] = useState('')
  const [curlCommand, setCurlCommand] = useState('')

  useTransferData(setUrl)

  // HTTP Methods
  const methods: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

  // Common Headers Presets
  const headerPresets = [
    { name: 'JSON', headers: [{ key: 'Content-Type', value: 'application/json' }] },
    { name: 'Form', headers: [{ key: 'Content-Type', value: 'application/x-www-form-urlencoded' }] },
    { name: 'Auth', headers: [{ key: 'Authorization', value: 'Bearer YOUR_TOKEN' }] },
  ]

  // Generate cURL Command
  useEffect(() => {
    let command = 'curl'

    // Method
    command += ` -X ${method}`

    // Headers
    if (headers.length > 0) {
      headers.forEach(({ key, value }) => {
        command += ` -H "${key}: ${value}"`
      })
    }

    // URL
    command += ` "${url}"`

    // Body (for POST/PUT/PATCH)
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && body) {
      command += ` \\\  -d '${body.replace(/'/g, "\\'")}'`
    }

    setCurlCommand(command)
  }, [url, method, headers, body])

  // Add Header
  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }])
  }

  // Remove Header
  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index))
  }

  // Update Header
  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers]
    newHeaders[index][field] = value
    setHeaders(newHeaders)
  }

  // Apply Preset
  const applyPreset = (preset: typeof headerPresets[number]) => {
    setHeaders(JSON.parse(JSON.stringify(preset.headers)))
  }

  // Copy to Clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(curlCommand)
  }

  const clearAll = () => {
    setUrl('https://api.example.com/users')
    setMethod('GET')
    setHeaders([{ key: 'Content-Type', value: 'application/json' }])
    setBody('')
  }

  return (
    <ToolShell
      title="CURL BUILDER"
      description={t('可视化构建 HTTP 请求，生成 cURL 命令')}
      path="/tools/curl"
      icon={Terminal}
      actions={
        <>
          <button onClick={copyToClipboard} className="tool-btn tool-btn-icon tool-btn-accent" title={t('复制')} aria-label={t('复制')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={clearAll} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Left Column - Request Builder */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>REQUEST</span>
              <span className="ml-auto normal-case tracking-normal">{method}</span>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
              {/* URL */}
              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">URL</label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://api.example.com/users"
                  className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* Method */}
              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">{t('请求方法')}</label>
                <div className="flex flex-wrap gap-2">
                  {methods.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m as typeof method)}
                      className={`chip ${method === m ? 'chip-active' : ''}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Headers */}
              <div>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <label className="block font-mono text-[11px] text-ink-muted">{t('请求头')}</label>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[11px] text-ink-muted">{t('预设:')}</span>
                    {headerPresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => applyPreset(preset)}
                        className="rounded border border-border-dim px-2 py-0.5 font-mono text-[11px] text-ink-secondary transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Header name"
                        className="min-w-0 flex-1 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                      />
                      <span className="font-mono text-ink-muted">:</span>
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="Value"
                        className="min-w-0 flex-1 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        aria-label={t('删除请求头')}
                        className="p-1 text-ink-muted transition-colors hover:text-neon-magenta"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addHeader}
                  className="mt-2 w-full rounded-md border border-dashed border-border-dim py-2 font-mono text-xs text-ink-muted transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                >
                  + {t('添加请求头')}
                </button>
              </div>

              {/* Body */}
              {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                <div>
                  <label className="mb-2 block font-mono text-[11px] text-ink-muted">{t('请求体')}</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder='{"name": "John", "age": 30}'
                    spellCheck={false}
                    className="h-32 w-full resize-none rounded-md border border-border-dim bg-void-200 p-3 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                  />
                </div>
              )}

              {/* Examples */}
              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">{t('常用示例')}</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setUrl('https://api.github.com/users/octocat')
                      setMethod('GET')
                      setHeaders([{ key: 'User-Agent', value: 'MyApp/1.0' }])
                      setBody('')
                    }}
                    className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left font-mono text-xs text-ink-secondary transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                  >
                    {t('GET · API 调用')}
                  </button>
                  <button
                    onClick={() => {
                      setUrl('https://api.example.com/users')
                      setMethod('POST')
                      setHeaders([{ key: 'Content-Type', value: 'application/json' }])
                      setBody('{"name":"John","email":"john@example.com"}')
                    }}
                    className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left font-mono text-xs text-ink-secondary transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                  >
                    {t('POST · JSON 数据')}
                  </button>
                  <button
                    onClick={() => {
                      setUrl('https://api.example.com/protected')
                      setMethod('GET')
                      setHeaders([{ key: 'Authorization', value: 'Bearer YOUR_TOKEN' }])
                    }}
                    className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 text-left font-mono text-xs text-ink-secondary transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                  >
                    {t('GET · 认证请求')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Command Output */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>OUTPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {curlCommand.length} {t('字符')}
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
              <pre className="whitespace-pre-wrap break-all rounded-md border border-border-dim bg-void p-3 font-mono text-sm leading-relaxed text-neon-lime">
                <code>{curlCommand}</code>
              </pre>

              <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                <h4 className="mb-2 font-mono text-[11px] text-ink-muted">{t('语法速查')}</h4>
                <ul className="space-y-1 font-mono text-xs text-ink-secondary">
                  <li>
                    <code className="text-neon-amber">-X METHOD</code> — {t('指定请求方法')}
                  </li>
                  <li>
                    <code className="text-neon-amber">-H &quot;Header&quot;</code> — {t('添加请求头')}
                  </li>
                  <li>
                    <code className="text-neon-amber">-d &apos;data&apos;</code> — {t('添加请求体')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
