'use client'

import { useState, useEffect } from 'react'
import { Braces, Copy, Trash2 } from 'lucide-react'
import { formatJson, minifyJson } from '@/lib/parsers/json'
import Editor from '@monaco-editor/react'

export default function JsonToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [editorTheme, setEditorTheme] = useState<'light' | 'vs-dark'>('light')

  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains('dark')
    setEditorTheme(isDark ? 'vs-dark' : 'light')

    // Observe theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark')
          setEditorTheme(isDark ? 'vs-dark' : 'light')
        }
      })
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])

  // 自动格式化
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }

    const { result, error: err } = formatJson(input, { indent, sortKeys })

    if (err) {
      setError(`行 ${err.line}, 列 ${err.column}: ${err.message}`)
      // Keep the previous output or clear it?
      // If we clear it, the user loses the formatted view while typing.
      // But if we don't, it might be confusing.
      // Let's clear it for now as per original logic.
      setOutput('')
    } else {
      setOutput(result)
      setError(null)
    }
  }, [input, indent, sortKeys])

  const handleFormat = () => {
    const { result, error: err } = formatJson(input, { indent, sortKeys })
    if (err) {
      setError(err.message)
    } else {
      setOutput(result)
    }
  }

  const handleMinify = () => {
    const { result, error: err } = minifyJson(input)
    if (err) {
      setError(err.message)
    } else {
      setOutput(result)
    }
  }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Braces className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display">JSON 格式化</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  格式化、压缩、验证 JSON 数据
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <button
            onClick={handleFormat}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg transition-all text-sm"
          >
            格式化
          </button>
          <button
            onClick={handleMinify}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-sm"
          >
            压缩
          </button>
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

          <div className="ml-auto flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">缩进:</span>
              <select
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
              >
                <option value={2}>2 空格</option>
                <option value={4}>4 空格</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="rounded"
              />
              <span className="text-gray-600 dark:text-gray-400">排序键</span>
            </label>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input */}
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">输入 JSON</h3>
              {error && (
                <span className="text-sm text-red-500">❌ {error}</span>
              )}
            </div>
            <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={input}
                theme={editorTheme}
                onChange={(value) => setInput(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* Output */}
          <div className="flex flex-col h-[600px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">输出</h3>
              {output && !error && (
                <span className="text-sm text-green-500">✓ 格式化成功</span>
              )}
            </div>
            <div className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={output}
                theme={editorTheme}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  automaticLayout: true,
                  folding: true,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>💡 支持 JSON 验证、格式化、压缩</span>
              <span>•</span>
              <span>所有处理在本地完成，不上传数据</span>
            </div>
            <div className="flex items-center gap-3">
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">Ctrl</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">F</kbd>
              <span className="ml-2">查找</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
