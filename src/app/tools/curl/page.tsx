'use client'

import { useState, useEffect } from 'react'
import { Terminal, Copy, Trash2, FileText } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

export default function CurlGeneratorPage() {
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
      description="可视化构建 HTTP 请求，生成 cURL 命令"
      path="/tools/curl"
      icon={Terminal}
      accent="cyan"
    >

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Builder */}
          <div className="space-y-4">
            {/* Request Info */}
            <div className="panel p-6">
              <h3 className="text-sm font-semibold mb-4">请求信息</h3>

              <div className="space-y-4">
                {/* URL */}
                <div>
                  <label className="block text-xs text-ink-secondary mb-2">
                    URL
                  </label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://api.example.com/users"
                    className="w-full px-3 py-2 font-mono text-sm border border-border-dim rounded-lg bg-void-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  />
                </div>

                {/* Method */}
                <div>
                  <label className="block text-xs text-ink-secondary mb-2">
                    请求方法
                  </label>
                  <div className="flex gap-2">
                    {methods.map((m) => (
                      <button
                        key={m}
                        onClick={() => setMethod(m as typeof method)}
                        className={`px-4 py-2 font-mono text-sm rounded-lg transition-all ${
                          method === m
                            ? 'bg-gray-800 text-white'
                            : 'bg-gray-100 dark:bg-gray-900 border border-border-dim hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Headers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs text-ink-secondary">
                      请求头
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-muted">预设:</span>
                      {headerPresets.map((preset, index) => (
                        <button
                          key={index}
                          onClick={() => applyPreset(preset)}
                          className="px-2 py-1 text-xs border border-border-dim rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {headers.map((header, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          placeholder="Header name"
                          className="flex-1 px-3 py-2 text-sm border border-border-dim rounded bg-void-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        <span className="text-gray-400">:</span>
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 px-3 py-2 text-sm border border-border-dim rounded bg-void-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                        />
                        <button
                          onClick={() => removeHeader(index)}
                          className="px-2 py-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={addHeader}
                    className="w-full px-3 py-2 border border-dashed border-border-dim rounded-lg text-sm text-ink-muted hover:text-gray-700 hover:border-gray-400 transition-all"
                  >
                    + 添加请求头
                  </button>
                </div>

                {/* Body */}
                {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
                  <div>
                    <label className="block text-xs text-ink-secondary mb-2">
                      请求体
                    </label>
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder='{"name": "John", "age": 30}'
                      className="w-full h-32 p-3 font-mono text-xs border border-border-dim rounded-lg bg-void-200 resize-none focus:outline-none focus:ring-2 focus:ring-gray-500"
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Command Preview */}
          <div className="space-y-4">
            {/* Generated Command */}
            <div className="bg-gray-900 dark:bg-gray-950 border border-gray-800 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-300">
                  cURL 命令
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    复制
                  </button>
                  <button
                    onClick={clearAll}
                    className="px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-800 text-gray-300 hover:text-white transition-all text-sm flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    清空
                  </button>
                </div>
              </div>

              {/* Command Display */}
              <div className="relative">
                <pre className="bg-gray-800 dark:bg-gray-900 text-green-400 p-4 rounded-lg whitespace-pre-wrap break-all text-sm border border-gray-700">
                  <code>{curlCommand}</code>
                </pre>
              </div>

              {/* Syntax Info */}
              <div className="mt-4 p-3 bg-gray-800 dark:bg-gray-900 border border-gray-700 rounded-lg">
                <h4 className="text-xs font-semibold text-gray-300 mb-2">语法说明</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li><code className="text-yellow-400">-X METHOD</code> - 指定请求方法</li>
                  <li><code className="text-blue-400">-H "Header"</code> - 添加请求头</li>
                  <li><code className="text-green-400">-d 'data'</code> - 添加请求体</li>
                  <li><code className="text-purple-400">--data-urlencode</code> - URL编码数据</li>
                  <li><code className="text-orange-400">-v</code> - 显示详细信息</li>
                </ul>
              </div>
            </div>

            {/* Examples */}
            <div className="panel p-6">
              <h3 className="text-sm font-semibold mb-4">常用示例</h3>

              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-ink-secondary mb-2">GET 请求</h4>
                  <button
                    onClick={() => {
                      setUrl('https://api.github.com/users/octocat')
                      setMethod('GET')
                      setHeaders([{ key: 'User-Agent', value: 'MyApp/1.0' }])
                      setBody('')
                    }}
                    className="w-full text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs text-left"
                  >
                    <div className="font-mono text-left text-ink-secondary">
                      API调用
                    </div>
                  </button>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-ink-secondary mb-2">POST JSON</h4>
                  <button
                    onClick={() => {
                      setUrl('https://api.example.com/users')
                      setMethod('POST')
                      setHeaders([{ key: 'Content-Type', value: 'application/json' }])
                      setBody('{"name":"John","email":"john@example.com"}')
                    }}
                    className="w-full text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs text-left"
                  >
                    <div className="font-mono text-left text-ink-secondary">
                      POST JSON数据
                    </div>
                  </button>
                </div>

                <div>
                  <                  h4 className="text-xs font-semibold text-ink-secondary mb-2">带认证</h4>
                  <button
                    onClick={() => {
                      setUrl('https://api.example.com/protected')
                      setMethod('GET')
                      setHeaders([{ key: 'Authorization', value: 'Bearer YOUR_TOKEN' }])
                    }}
                    className="w-full text-left p-3 bg-void-200 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs text-left"
                  >
                    <div className="font-mono text-left text-ink-secondary">
                      API认证请求
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </ToolShell>
  )
}
