'use client'

import { useState, useEffect } from 'react'
import { Braces, Copy, Trash2, Wand2, Minimize2, ArrowDownAZ } from 'lucide-react'
import { formatJson, minifyJson } from '@/lib/parsers/json'
import { useTransferData } from '@/lib/useTransferData'
import Editor, { type Monaco } from '@monaco-editor/react'
import { ToolShell } from '@/components/ToolShell'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/components/I18nProvider'

// Monaco themes matching the site palette (dark + light)
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
  monaco.editor.defineTheme('devtools-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '0084AD' },
      { token: 'string.value.json', foreground: 'A85A00' },
      { token: 'number', foreground: '7C3AED' },
      { token: 'keyword', foreground: 'C81E6E' },
      { token: 'comment', foreground: '8590A5' },
    ],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#181E2C',
      'editorLineNumber.foreground': '#8590A5',
      'editorLineNumber.activeForeground': '#4E596E',
      'editorCursor.foreground': '#0084AD',
      'editor.selectionBackground': '#0084AD33',
      'editor.lineHighlightBackground': '#F0F3F8',
      'editorIndentGuide.background1': '#E1E5EE',
      'editorIndentGuide.activeBackground1': '#BAC3D4',
      'editorWidget.background': '#FFFFFF',
      'editorWidget.border': '#DBE0EA',
      'editorGutter.background': '#FFFFFF',
      'scrollbarSlider.background': '#DBE0EAAA',
      'scrollbarSlider.hoverBackground': '#BAC3D4AA',
    },
  })
}

export default function JsonToolPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)
  const { theme } = useTheme()
  const { t, lang } = useI18n()

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
      setError(
        lang === 'en'
          ? `Line ${err.line}, Col ${err.column}: ${err.message}`
          : `行 ${err.line}, 列 ${err.column}: ${err.message}`
      )
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
      description={t('格式化、压缩、验证 JSON 数据')}
      path="/tools/json"
      icon={Braces}
      actions={
        <>
          <select
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            aria-label={t('缩进')}
            title={t('缩进')}
            className="tool-select"
          >
            <option value={2}>2</option>
            <option value={4}>4</option>
          </select>
          <button
            onClick={() => setSortKeys(!sortKeys)}
            aria-pressed={sortKeys}
            title={t('SORT KEYS')}
            aria-label={t('SORT KEYS')}
            className={`tool-btn tool-btn-icon ${sortKeys ? 'tool-btn-accent' : ''}`}
          >
            <ArrowDownAZ className="h-3.5 w-3.5" />
          </button>

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          <button onClick={handleFormat} className="tool-btn tool-btn-icon tool-btn-accent" title={t('格式化')} aria-label={t('格式化')}>
            <Wand2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleMinify} className="tool-btn tool-btn-icon" title={t('压缩')} aria-label={t('压缩')}>
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleCopy} disabled={!output} className="tool-btn tool-btn-icon" title={t('复制')} aria-label={t('复制')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={handleClear} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
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
                <span className="ml-auto normal-case tracking-normal">{input.length} {t('字符')}</span>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={input}
                theme={theme === "light" ? "devtools-light" : "devtools-dark"}
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
                theme={theme === "light" ? "devtools-light" : "devtools-dark"}
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
