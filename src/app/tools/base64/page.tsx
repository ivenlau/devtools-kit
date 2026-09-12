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
      actions={
        <>
          <button
            onClick={() => setMode('encode')}
            className={`tool-btn ${mode === 'encode' ? 'tool-btn-accent' : ''}`}
          >
            编码
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`tool-btn ${mode === 'decode' ? 'tool-btn-accent' : ''}`}
          >
            解码
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
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Workspace */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Input */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-lime">&gt;_</span>
              <span>{mode === 'encode' ? 'INPUT.TEXT' : 'INPUT.BASE64'}</span>
              {error ? (
                <span className="ml-auto max-w-[60%] truncate text-neon-red normal-case tracking-normal">
                  ERR · {error}
                </span>
              ) : (
                <span className="ml-auto normal-case tracking-normal">{input.length} 字符</span>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64...'}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-lime placeholder:text-ink-muted focus:outline-none"
              spellCheck={false}
            />
          </div>

          {/* Output */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-lime">&gt;_</span>
              <span>{mode === 'encode' ? 'OUTPUT.B64' : 'OUTPUT.TEXT'}</span>
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
              value={output}
              readOnly
              placeholder="转换结果将显示在这里..."
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
