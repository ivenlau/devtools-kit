'use client'

import { useState, useEffect } from 'react'
import { Link2, Copy, Trash2 } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

/**
 * URL 编码
 */
const urlEncode = (text: string): string => {
  try {
    return encodeURIComponent(text)
  } catch (error) {
    return ''
  }
}

/**
 * URL 解码
 */
const urlDecode = (encoded: string): string => {
  try {
    return decodeURIComponent(encoded)
  } catch (error) {
    return '解码失败：无效的URL编码'
  }
}

/**
 * 解析URL
 */
const parseUrl = (urlString: string) => {
  try {
    const url = new URL(urlString)
    return {
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
      params: Object.fromEntries(url.searchParams.entries()),
    }
  } catch (error) {
    return null
  }
}

export default function UrlEncoderPage() {
  const [mode, setMode] = useState<'encode' | 'decode' | 'parse'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [urlData, setUrlData] = useState<any>(null)

  useTransferData(setInput)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      setUrlData(null)
      return
    }

    try {
      if (mode === 'encode') {
        setOutput(urlEncode(input))
        setError(null)
      } else if (mode === 'decode') {
        setOutput(urlDecode(input))
        setError(null)
      } else if (mode === 'parse') {
        const parsed = parseUrl(input)
        if (parsed) {
          setUrlData(parsed)
          setError(null)
        } else {
          setError('无效的URL')
          setUrlData(null)
        }
      }
    } catch (err: any) {
      setError(err.message || '处理失败')
      setOutput('')
      setUrlData(null)
    }
  }, [input, mode])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
    setUrlData(null)
  }

  return (
    <ToolShell
      title="URL CODEC"
      description="URL 编码、解码与解析"
      path="/tools/url"
      icon={Link2}
      accent="cyan"
    >
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setMode('encode')}
          className={`chip !px-4 !py-2 ${mode === 'encode' ? 'chip-active' : ''}`}
        >
          编码模式
        </button>
        <button
          onClick={() => setMode('decode')}
          className={`chip !px-4 !py-2 ${mode === 'decode' ? 'chip-active' : ''}`}
        >
          解码模式
        </button>
        <button
          onClick={() => setMode('parse')}
          className={`chip !px-4 !py-2 ${mode === 'parse' ? 'chip-active' : ''}`}
        >
          URL 解析
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!output && mode !== 'parse'}
            className="chip !px-4 !py-2 disabled:opacity-40"
          >
            <Copy className="mr-1.5 h-3.5 w-3.5" />
            复制
          </button>
          <button
            onClick={handleClear}
            className="chip !px-4 !py-2 hover:!border-neon-red hover:!text-neon-red"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            清空
          </button>
        </div>
      </div>

      {/* 编码/解码模式 */}
      {mode !== 'parse' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Input */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[11px] text-ink-secondary">
                {mode === 'encode' ? '输入文本' : '输入 URL 编码'}
              </h3>
              {error && <span className="font-mono text-[11px] text-neon-red">ERR · {error}</span>}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 URL 编码...'}
              className="panel-glow min-h-[400px] flex-1 resize-none p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-mono text-[11px] text-ink-secondary">
                {mode === 'encode' ? 'URL 编码结果' : '解码结果'}
              </h3>
              {output && !error && <span className="font-mono text-[11px] text-neon-lime">✓ OK</span>}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="处理结果将显示在这里..."
              className="panel-glow min-h-[400px] flex-1 resize-none p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      {/* URL 解析模式 */}
      {mode === 'parse' && (
        <div className="mx-auto max-w-4xl space-y-4">
          {/* Input */}
          <div>
            <label className="mb-2 block font-mono text-[11px] text-ink-secondary">输入 URL</label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com:8080/path/to/page?param1=value1&param2=value2#section"
              className="w-full rounded-lg border border-border-dim bg-void-200 px-4 py-3 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
              spellCheck={false}
            />
            {error && <p className="mt-2 font-mono text-[11px] text-neon-red">{error}</p>}
          </div>

          {/* Parsed Data */}
          {urlData && (
            <div className="panel-glow rounded-xl p-6">
              <h3 className="mb-4 font-display text-lg font-semibold text-ink-primary">解析结果</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Protocol</span>
                    <p className="font-mono text-sm text-ink-primary">{urlData.protocol}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Hostname</span>
                    <p className="font-mono text-sm text-ink-primary">{urlData.hostname}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Port</span>
                    <p className="font-mono text-sm text-ink-primary">{urlData.port || '(默认)'}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Pathname</span>
                    <p className="break-all font-mono text-sm text-ink-primary">{urlData.pathname}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Search</span>
                    <p className="break-all font-mono text-sm text-ink-primary">{urlData.search || '(无)'}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Hash</span>
                    <p className="break-all font-mono text-sm text-ink-primary">{urlData.hash || '(无)'}</p>
                  </div>
                </div>

                {/* Query Parameters */}
                {Object.keys(urlData.params).length > 0 && (
                  <div className="mt-6">
                    <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">Query Parameters</h4>
                    <div className="space-y-2">
                      {Object.entries(urlData.params).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-4 rounded-lg bg-void-200 p-3"
                        >
                          <code className="font-mono text-sm font-bold text-neon-cyan">{key}</code>
                          <span className="text-ink-muted">=</span>
                          <code className="flex-1 break-all font-mono text-sm text-ink-primary">{String(value)}</code>
                          <button
                            onClick={() => copyToClipboard(`${key}=${value}`)}
                            className="text-ink-muted hover:text-neon-cyan"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 font-mono text-[11px] text-ink-muted">
        local only · URL 编码处理特殊字符 · URL 解析可分解各组成部分
      </div>
    </ToolShell>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
