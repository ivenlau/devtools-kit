'use client'

import { useState, useEffect } from 'react'
import { Shield, Copy, Trash2, Eye, EyeOff, FileText } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

interface JWTPayload {
  [key: string]: any
  iss?: string
  sub?: string
  aud?: string | string[]
  exp?: number
  nbf?: number
  iat?: number
  jti?: string
}

interface DecodedToken {
  header: any
  payload: JWTPayload
  signature: string
  isValid: boolean
  error?: string
}

const EXAMPLE_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

export default function JWTDecoderPage() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<DecodedToken | null>(null)
  const [showHeader, setShowHeader] = useState(true)
  const [showPayload, setShowPayload] = useState(true)

  useTransferData(setInput)

  // Decode JWT
  useEffect(() => {
    if (!input.trim()) {
      setDecoded(null)
      return
    }

    try {
      const parts = input.split('.')
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format')
      }

      // Decode header
      const header = JSON.parse(atob(parts[0]))

      // Decode payload
      const payload = jwtDecode<JWTPayload>(input)

      // Signature (can't decode without secret)
      const signature = parts[2]

      setDecoded({
        header,
        payload,
        signature,
        isValid: true,
      })
    } catch (error: any) {
      setDecoded({
        header: null,
        payload: {},
        signature: '',
        isValid: false,
        error: error.message || 'Invalid JWT token',
      })
    }
  }, [input])

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-'
    return new Date(timestamp * 1000).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // Check if token is expired
  const isExpired = () => {
    if (!decoded || !decoded.isValid || !decoded.payload.exp) return false
    return Date.now() >= decoded.payload.exp * 1000
  }

  // Time remaining
  const getTimeRemaining = () => {
    if (!decoded || !decoded.isValid || !decoded.payload.exp) return null
    const remaining = decoded.payload.exp * 1000 - Date.now()
    if (remaining <= 0) return '已过期'

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24))
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}天 ${hours}小时`
    if (hours > 0) return `${hours}小时 ${minutes}分钟`
    return `${minutes}分钟`
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setDecoded(null)
  }

  // Pretty print JSON
  const prettyJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2)
  }

  const statusColor = decoded
    ? decoded.isValid
      ? isExpired()
        ? 'bg-neon-amber'
        : 'bg-neon-lime'
      : 'bg-neon-magenta'
    : 'bg-ink-muted'

  return (
    <ToolShell
      title="JWT DECODE"
      description="解码和验证 JSON Web Token"
      path="/tools/jwt"
      icon={Shield}
      accent="amber"
      actions={
        <>
          <button
            onClick={() => {
              setInput(EXAMPLE_TOKEN)
            }}
            className="tool-btn"
          >
            <FileText className="h-3.5 w-3.5" />
            示例
          </button>
          {decoded && showHeader && decoded.header && (
            <button
              onClick={() => copyToClipboard(prettyJSON(decoded.header))}
              className="tool-btn"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 Header
            </button>
          )}
          {decoded && showPayload && (
            <button
              onClick={() => copyToClipboard(prettyJSON(decoded.payload))}
              className="tool-btn"
            >
              <Copy className="h-3.5 w-3.5" />
              复制 Payload
            </button>
          )}
          {input && (
            <button onClick={clearAll} className="tool-btn tool-btn-danger">
              <Trash2 className="h-3.5 w-3.5" />
              清空
            </button>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          {/* Left Column - Token Input */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-amber">&gt;_</span>
              <span>TOKEN</span>
              <span className="ml-auto normal-case tracking-normal">{input.length} 字符</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value.trim())}
              placeholder="粘贴 JWT Token..."
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-amber placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          {/* Right Column - Decoded */}
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-amber">&gt;_</span>
              <span>DECODED</span>
              <span className="ml-auto flex items-center gap-1.5 normal-case tracking-normal">
                <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusColor}`} />
                {decoded
                  ? decoded.isValid
                    ? isExpired()
                      ? '已过期'
                      : '有效'
                    : '无效'
                  : '待输入'}
              </span>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
              {!decoded && (
                <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 text-center">
                  <Shield className="h-12 w-12 text-ink-muted" />
                  <p className="font-mono text-xs text-ink-muted">输入 JWT Token 开始解码</p>
                </div>
              )}

              {decoded && (
                <>
                  {/* Status */}
                  <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusColor}`} />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-sm font-semibold text-ink-primary">
                          {decoded.isValid
                            ? isExpired()
                              ? 'Token 已过期'
                              : 'Token 有效'
                            : 'Token 无效'}
                        </div>
                        {!decoded.isValid && decoded.error && (
                          <div className="mt-1 font-mono text-xs text-neon-magenta">
                            {decoded.error}
                          </div>
                        )}
                        {decoded.isValid && decoded.payload.exp && (
                          <div className="mt-1 font-mono text-xs text-ink-secondary">
                            剩余时间: {getTimeRemaining()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Header */}
                  <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                    <button
                      onClick={() => setShowHeader(!showHeader)}
                      className="flex w-full items-center justify-between font-mono text-xs text-ink-secondary transition-colors hover:text-neon-amber"
                    >
                      <span>HEADER · 头部</span>
                      {showHeader ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {showHeader && decoded.header && (
                      <pre className="mt-3 overflow-x-auto rounded-md border border-border-dim bg-void p-3 font-mono text-xs leading-relaxed text-neon-lime">
                        <code>{prettyJSON(decoded.header)}</code>
                      </pre>
                    )}
                  </div>

                  {/* Payload */}
                  <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                    <button
                      onClick={() => setShowPayload(!showPayload)}
                      className="flex w-full items-center justify-between font-mono text-xs text-ink-secondary transition-colors hover:text-neon-amber"
                    >
                      <span>PAYLOAD · 载荷</span>
                      {showPayload ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {showPayload && (
                      <div className="mt-3 space-y-4">
                        {/* Standard Claims */}
                        {decoded.isValid && (
                          <div className="space-y-2">
                            <h4 className="font-mono text-[11px] text-ink-muted">标准声明</h4>

                            {Object.entries({
                              'Issuer (iss)': decoded.payload.iss,
                              'Subject (sub)': decoded.payload.sub,
                              'Audience (aud)': decoded.payload.aud,
                              'Expires (exp)': decoded.payload.exp,
                              'Not Before (nbf)': decoded.payload.nbf,
                              'Issued At (iat)': decoded.payload.iat,
                              'JWT ID (jti)': decoded.payload.jti,
                            }).map(([key, value]) => (
                              value && (
                                <div
                                  key={key}
                                  className="flex items-center justify-between gap-3 rounded-md bg-void-200 p-2 text-xs"
                                >
                                  <span className="text-ink-secondary">{key}</span>
                                  <span className="font-mono text-ink-primary">
                                    {typeof value === 'number'
                                      ? key.includes('Time') ||
                                        key.includes('exp') ||
                                        key.includes('nbf') ||
                                        key.includes('iat')
                                        ? formatDate(value)
                                        : value
                                      : String(value)}
                                  </span>
                                </div>
                              )
                            ))}
                          </div>
                        )}

                        {/* Full Payload JSON */}
                        <div>
                          <h4 className="mb-2 font-mono text-[11px] text-ink-muted">完整数据</h4>
                          <pre className="overflow-x-auto rounded-md border border-border-dim bg-void p-3 font-mono text-xs leading-relaxed text-neon-lime">
                            <code>{prettyJSON(decoded.payload)}</code>
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Signature */}
                  <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                    <h4 className="mb-2 font-mono text-[11px] text-ink-muted">SIGNATURE · 签名</h4>
                    <div className="rounded-md border border-border-dim bg-void p-3">
                      <p className="break-all font-mono text-xs text-neon-amber">
                        {decoded.signature}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
