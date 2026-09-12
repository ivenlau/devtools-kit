'use client'

import { useState, useEffect } from 'react'
import { Braces, Copy, Trash2, Wand2, Minimize2 } from 'lucide-react'
import { formatJson, minifyJson } from '@/lib/parsers/json'
import { useTransferData } from '@/lib/useTransferData'
import Editor, { type Monaco } from '@monaco-editor/react'
import { ToolShell } from '@/components/ToolShell'

// Monaco theme matching the site palette (void panels + neon accents)
function defineEditorTheme(monaco: Monaco) {
  monaco.editor.defineTheme('devtools-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '00E5FF' },
      { token: 'string.value.json', foreground: 'FFB86C' },
      { token: 'number', foreground: 'A855F7' },
      { token: 'keyword', foreground: 'FF2D95' },
      { token: 'comment', foreground: '4E5A73' },
    ],
    colors: {
      'editor.background': '#0B0D14',
      'editor.foreground': '#E8ECF4',
      'editorLineNumber.foreground': '#4E5A73',
      'editorLineNumber.activeForeground': '#8B96AD',
      'editorCursor.foreground': '#00E5FF',
      'editor.selectionBackground': '#00E5FF33',
      'editor.lineHighlightBackground': '#111522',
      'editorIndentGuide.background1': '#1A2035',
      'editorIndentGuide.activeBackground1': '#2A3558',
      'editorWidget.background': '#111522',
      'editorWidget.border': '#1A2035',
      'editorGutter.background': '#0B0D14',
      'scrollbarSlider.background': '#1A2035AA',
      'scrollbarSlider.hoverBackground': '#2A3558AA',
    },
  })
}

export default function JsonToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)

  useTransferData(setInput)

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
      actions={
        <>
          <label className="flex items-center gap-1.5 font-mono text-[11px] text-ink-muted">
            INDENT
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="tool-select"
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 font-mono text-[11px] text-ink-secondary">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(e) => setSortKeys(e.target.checked)}
              className="accent-neon-cyan"
            />
            SORT KEYS
          </label>

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          <button onClick={handleFormat} className="tool-btn tool-btn-accent">
            <Wand2 className="h-3.5 w-3.5" />
            格式化
          </button>
          <button onClick={handleMinify} className="tool-btn">
            <Minimize2 className="h-3.5 w-3.5" />
            压缩
          </button>
          <button onClick={handleCopy} disabled={!output} className="tool-btn">
            <Copy className="h-3.5 w-3.5" />
            复制
          </button>
          <button onClick={handleClear} className="tool-btn tool-btn-danger">
            <Trash2 className="h-3.5 w-3.5" />
            清空
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        {/* Workspace */}
        <div className="grid flex-1 grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Input */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>INPUT.JSON</span>
              {error ? (
                <span className="ml-auto max-w-[60%] truncate text-neon-red normal-case tracking-normal">
                  ERR · {error}
                </span>
              ) : (
                <span className="ml-auto normal-case tracking-normal">{input.length} 字符</span>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={input}
                theme="devtools-dark"
                beforeMount={defineEditorTheme}
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

          {/* Output */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>OUTPUT</span>
              <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                {output && !error ? (
                  <>
                    <span className="status-dot" />valid
                  </>
                ) : (
                  'idle'
                )}
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={output}
                theme="devtools-dark"
                beforeMount={defineEditorTheme}
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
      </div>
    </ToolShell>
  )
}
