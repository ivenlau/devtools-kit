'use client'

import { useState, useEffect } from 'react'
import { Link2, Copy, Trash2, ArrowRight, ArrowLeft, ScanSearch } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

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
  const { t } = useI18n()
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
          setError(t('无效的URL'))
          setUrlData(null)
        }
      }
    } catch (err: any) {
      setError(err.message || t('处理失败'))
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
      description={t('URL 编码、解码与解析')}
      path="/tools/url"
      icon={Link2}
      actions={
        <>
          <button
            onClick={() => setMode('encode')}
            aria-pressed={mode === 'encode'}
            title={t('编码')}
            aria-label={t('编码')}
            className={`tool-btn tool-btn-icon ${mode === 'encode' ? 'tool-btn-accent' : ''}`}
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setMode('decode')}
            aria-pressed={mode === 'decode'}
            title={t('解码')}
            aria-label={t('解码')}
            className={`tool-btn tool-btn-icon ${mode === 'decode' ? 'tool-btn-accent' : ''}`}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setMode('parse')}
            aria-pressed={mode === 'parse'}
            title={t('解析')}
            aria-label={t('解析')}
            className={`tool-btn tool-btn-icon ${mode === 'parse' ? 'tool-btn-accent' : ''}`}
          >
            <ScanSearch className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCopy}
            disabled={!output && mode !== 'parse'}
            className="tool-btn tool-btn-icon"
           title={t('复制')} aria-label={t('复制')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleClear} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* 编码/解码模式 */}
        {mode !== 'parse' && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-var(--header-total)-4.5rem)] lg:grid-rows-[minmax(0,1fr)]">
            {/* Input */}
            <div className="tool-panel h-full min-h-[400px]">
              <div className="tool-panel-head">
                <span className="text-neon-cyan">&gt;_</span>
                <span>{mode === 'encode' ? 'INPUT.TEXT' : 'INPUT.URL'}</span>
                {error ? (
                  <span className="ml-auto max-w-[60%] truncate text-neon-red normal-case tracking-normal">
                    ERR · {error}
                  </span>
                ) : (
                  <span className="ml-auto normal-case tracking-normal">{input.length} {t('字符')}</span>
                )}
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? t('输入要编码的文本...') : t('输入要解码的 URL 编码...')}
                className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-cyan placeholder:text-ink-muted focus:outline-none"
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="tool-panel h-full min-h-[400px]">
              <div className="tool-panel-head">
                <span className="text-neon-cyan">&gt;_</span>
                <span>{mode === 'encode' ? 'OUTPUT.URL' : 'OUTPUT.TEXT'}</span>
                <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                  {output && !error ? (
                    <>
                      <span className="status-dot" />ok
                    </>
                  ) : (
                    'idle'
                  )}
                </span>
              </div>
              <textarea
                value={output === '解码失败：无效的URL编码' ? t('解码失败：无效的URL编码') : output}
                readOnly
                placeholder={t('处理结果将显示在这里...')}
                className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* URL 解析模式 */}
        {mode === 'parse' && (
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-var(--header-total)-4.5rem)] lg:grid-rows-[minmax(0,1fr)]">
            {/* Input */}
            <div className="tool-panel h-full min-h-[400px]">
              <div className="tool-panel-head">
                <span className="text-neon-cyan">&gt;_</span>
                <span>INPUT.URL</span>
                {error && (
                  <span className="ml-auto normal-case tracking-normal text-neon-red">
                    ERR · {error}
                  </span>
                )}
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="https://example.com:8080/path/to/page?param1=value1&param2=value2#section"
                  className="w-full rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                  spellCheck={false}
                />
                <p className="font-mono text-[11px] text-ink-muted">
                  {t('输入完整 URL，右侧实时分解各组成部分')}
                </p>
              </div>
            </div>

            {/* Parsed Data */}
            <div className="tool-panel h-full min-h-[400px]">
              <div className="tool-panel-head">
                <span className="text-neon-cyan">&gt;_</span>
                <span>PARSED</span>
                <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                  {urlData && !error ? (
                    <>
                      <span className="status-dot" />ok
                    </>
                  ) : (
                    'idle'
                  )}
                </span>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">
                {urlData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                        <p className="font-mono text-sm text-ink-primary">{urlData.port || t('(默认)')}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Pathname</span>
                        <p className="break-all font-mono text-sm text-ink-primary">{urlData.pathname}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Search</span>
                        <p className="break-all font-mono text-sm text-ink-primary">{urlData.search || t('(无)')}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">Hash</span>
                        <p className="break-all font-mono text-sm text-ink-primary">{urlData.hash || t('(无)')}</p>
                      </div>
                    </div>

                    {/* Query Parameters */}
                    {Object.keys(urlData.params).length > 0 && (
                      <div className="border-t border-border-dim pt-3">
                        <h4 className="mb-3 font-mono text-[11px] uppercase tracking-wider text-ink-secondary">Query Parameters</h4>
                        <div className="space-y-2">
                          {Object.entries(urlData.params).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center gap-4 rounded-md bg-void-200 p-3"
                            >
                              <code className="font-mono text-sm font-bold text-neon-cyan">{key}</code>
                              <span className="text-ink-muted">=</span>
                              <code className="flex-1 break-all font-mono text-sm text-ink-primary">{String(value)}</code>
                              <button
                                onClick={() => copyToClipboard(`${key}=${value}`)}
                                className="text-ink-muted transition-colors hover:text-neon-cyan"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-xs text-ink-muted">// {t('等待输入有效的 URL')}</p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </ToolShell>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
