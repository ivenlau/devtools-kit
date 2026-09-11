'use client'

import { useState, useEffect } from 'react'
import { FileCode, Copy, Trash2 } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

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

  useTransferData(setInput)

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
    <ToolShell
      title="BASE64"
      description="Base64 编码与解码，支持 UTF-8 文本"
      path="/tools/base64"
      icon={FileCode}
      accent="lime"
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

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!output}
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

      {/* Editor Area */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] text-ink-secondary">
              {mode === 'encode' ? '输入文本' : '输入 Base64'}
            </h3>
            {error && (
              <span className="font-mono text-[11px] text-neon-red">ERR · {error}</span>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64...'}
            className="panel-glow min-h-[500px] flex-1 resize-none p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] text-ink-secondary">
              {mode === 'encode' ? 'Base64 结果' : '解码结果'}
            </h3>
            {output && !error && (
              <span className="font-mono text-[11px] text-neon-lime">✓ OK</span>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="转换结果将显示在这里..."
            className="panel-glow min-h-[500px] flex-1 resize-none p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted"
            spellCheck={false}
          />
        </div>
      </div>

      <div className="mt-4 font-mono text-[11px] text-ink-muted">
        local only · no upload · 支持 UTF-8 编码
      </div>
    </ToolShell>
  )
}
