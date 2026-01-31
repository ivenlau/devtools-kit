'use client'

import { useState, useEffect } from 'react'
import { FileCode, Copy, Trash2 } from 'lucide-react'

/**
 * Base64 编码
 */
const base64Encode = (text: string): string => {
  try {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(text)
    const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')
    return btoa(binary)
  } catch (error) {
    return ''
  }
}

/**
 * Base64 解码
 */
const base64Decode = (base64: string): string => {
  try {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const decoder = new TextDecoder()
    return decoder.decode(bytes)
  } catch (error) {
    throw new Error('无效的Base64字符串')
  }
}

export default function Base64ToolPage() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    try {
      if (mode === 'encode') {
        setOutput(base64Encode(input))
      } else {
        setOutput(base64Decode(input))
      }
      setError(null)
    } catch (err: any) {
      setError(err.message || '转换失败')
      setOutput('')
    }
  }, [input, mode])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <FileCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">Base64 编解码</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Base64 编码与解码，支持 UTF-8 文本
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
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            编码模式
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
              mode === 'decode'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            解码模式
          </button>

          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={handleCopy}
              disabled={!output}
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

      {/* Editor Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? '输入文本' : '输入 Base64'}
              </h3>
              {error && (
                <span className="text-sm text-red-500">❌ {error}</span>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64...'}
              className="flex-1 min-h-[500px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mode === 'encode' ? 'Base64 结果' : '解码结果'}
              </h3>
              {output && !error && (
                <span className="text-sm text-green-500">✓ 转换成功</span>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="flex-1 min-h-[500px] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 支持 UTF-8 编码</span>
              <span>•</span>
              <span>所有处理在本地完成</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
