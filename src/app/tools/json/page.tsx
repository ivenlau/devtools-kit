'use client'

import { useState, useEffect } from 'react'
import { Braces, Copy, Trash2 } from 'lucide-react'
import { formatJson, minifyJson } from '@/lib/parsers/json'
import { useTransferData } from '@/lib/useTransferData'
import Editor from '@monaco-editor/react'
import { ToolShell } from '@/components/ToolShell'

export default function JsonToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const [editorTheme, setEditorTheme] = useState<'light' | 'vs-dark'>('vs-dark')

  useTransferData(setInput)

  useEffect(() => {
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
    <ToolShell
      title="JSON FORMAT"
      description="格式化、压缩、验证 JSON 数据"
      path="/tools/json"
      icon={Braces}
      accent="cyan"
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button onClick={handleFormat} className="btn-neon !px-4 !py-2">
          FORMAT
        </button>
        <button onClick={handleMinify} className="chip chip-active !px-4 !py-2">
          MINIFY
        </button>
        <button
          onClick={handleCopy}
          disabled={!output}
          className="chip !px-4 !py-2 disabled:opacity-40"
        >
          <Copy className="mr-1.5 h-3.5 w-3.5" />
          COPY
        </button>
        <button onClick={handleClear} className="chip !px-4 !py-2 hover:!border-neon-red hover:!text-neon-red">
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
          CLEAR
        </button>

        <div className="ml-auto flex items-center gap-4">
          <label className="flex items-center gap-2 font-mono text-xs text-ink-secondary">
            <span>INDENT</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="rounded-md border border-border-dim bg-void-200 px-2 py-1.5 font-mono text-xs text-ink-primary focus:border-neon-cyan focus:outline-none"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 font-mono text-xs text-ink-secondary">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="rounded accent-neon-cyan"
            />
            SORT KEYS
          </label>
          <span className="font-mono text-[11px] text-neon-lime">
            {error ? 'invalid' : output ? 'valid' : 'idle'}
            {output && !error ? ' · ok' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex h-[600px] flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[11px] text-ink-secondary">
              <span className="flex gap-1.5">
                <i className="block h-2 w-2 rounded-full bg-[#FF5F56]" />
                <i className="block h-2 w-2 rounded-full bg-[#FFBD2E]" />
                <i className="block h-2 w-2 rounded-full bg-[#27C93F]" />
              </span>
              input.json
            </div>
            {error && (
              <span className="font-mono text-[11px] text-neon-red">ERR · {error}</span>
            )}
          </div>
          <div className="panel-glow flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={input}
              theme={editorTheme}
              onChange={(value) => setInput(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                wordWrap: 'on',
                formatOnPaste: true,
                automaticLayout: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>

        <div className="flex h-[600px] flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] text-ink-secondary">formatted</span>
            {output && !error && (
              <span className="font-mono text-[11px] text-neon-lime">✓ OK</span>
            )}
          </div>
          <div className="panel-glow flex-1 overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={output}
              theme={editorTheme}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'JetBrains Mono, monospace',
                wordWrap: 'on',
                automaticLayout: true,
                folding: true,
                padding: { top: 12 },
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-ink-muted">
        <span>local only · no upload · paste JSON on home to auto-route</span>
        <span>
          <kbd className="rounded border border-border-dim bg-void-200 px-1.5 py-0.5">Ctrl</kbd>
          {' + '}
          <kbd className="rounded border border-border-dim bg-void-200 px-1.5 py-0.5">F</kbd>
          {' find'}
        </span>
      </div>
    </ToolShell>
  )
}
