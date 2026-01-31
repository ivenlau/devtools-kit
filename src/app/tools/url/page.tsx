'use client'

import { useState, useEffect } from 'react'
import { Link2, Copy, Trash2 } from 'lucide-react'

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Link2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">URL 编解码</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                URL 编码、解码与解析
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setMode('encode')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              mode === 'encode'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            编码模式
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              mode === 'decode'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            解码模式
          </button>
          <button
            onClick={() => setMode('parse')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              mode === 'parse'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            URL 解析
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={!output && mode !== 'parse'}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              复制
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              清空
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 编码/解码模式 */}
        {mode !== 'parse' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? '输入文本' : '输入 URL 编码'}
                </h3>
                {error && <span className="text-sm text-red-500">❌ {error}</span>}
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 URL 编码...'}
                className="flex-1 min-h-[400px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
                spellCheck={false}
              />
            </div>

            {/* Output */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {mode === 'encode' ? 'URL 编码结果' : '解码结果'}
                </h3>
                {output && !error && <span className="text-sm text-green-500">✓ 处理成功</span>}
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="处理结果将显示在这里..."
                className="flex-1 min-h-[400px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        )}

        {/* URL 解析模式 */}
        {mode === 'parse' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Input */}
            <div>
              <label className="block text-sm font-medium mb-2">输入 URL</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="https://example.com:8080/path/to/page?param1=value1&param2=value2#section"
                className="w-full px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                spellCheck={false}
              />
              {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            </div>

            {/* Parsed Data */}
            {urlData && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">解析结果</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Protocol</span>
                      <p className="font-mono text-sm">{urlData.protocol}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Hostname</span>
                      <p className="font-mono text-sm">{urlData.hostname}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Port</span>
                      <p className="font-mono text-sm">{urlData.port || '(默认)'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Pathname</span>
                      <p className="font-mono text-sm break-all">{urlData.pathname}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Search</span>
                      <p className="font-mono text-sm break-all">{urlData.search || '(无)'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Hash</span>
                      <p className="font-mono text-sm break-all">{urlData.hash || '(无)'}</p>
                    </div>
                  </div>

                  {/* Query Parameters */}
                  {Object.keys(urlData.params).length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold mb-3">Query Parameters</h4>
                      <div className="space-y-2">
                        {Object.entries(urlData.params).map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                          >
                            <code className="text-sm font-mono text-cyan-600 font-bold">{key}</code>
                            <span className="text-gray-400">=</span>
                            <code className="text-sm font-mono flex-1 break-all">{String(value)}</code>
                            <button
                              onClick={() => copyToClipboard(`${key}=${value}`)}
                              className="text-gray-400 hover:text-cyan-500"
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
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 URL 编码用于处理特殊字符 • URL 解析可分解URL的各个组成部分
          </div>
        </div>
      </div>
    </div>
  )
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
}
