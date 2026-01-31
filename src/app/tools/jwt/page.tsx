'use client'

import { useState, useEffect } from 'react'
import { Shield, Copy, Trash2, Eye, EyeOff } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'

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

export default function JWTDecoderPage() {
  const [input, setInput] = useState('')
  const [decoded, setDecoded] = useState<DecodedToken | null>(null)
  const [showHeader, setShowHeader] = useState(true)
  const [showPayload, setShowPayload] = useState(true)

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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">JWT 解码器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                解码和验证 JSON Web Token
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            {/* Input */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">JWT Token</h3>
                {input && (
                  <button
                    onClick={clearAll}
                    className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    清空
                  </button>
                )}
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.trim())}
                placeholder="粘贴 JWT Token..."
                className="w-full h-64 p-4 font-mono text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />

              {/* Format hint */}
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>JWT 格式：</strong> header.payload.signature
                </p>
              </div>
            </div>

            {/* Example Token */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">示例 Token</h3>
              <button
                onClick={() => {
                  setInput('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c')
                }}
                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
                  加载示例 JWT Token
                </div>
              </button>
            </div>
          </div>

          {/* Right Column - Decoded */}
          <div className="space-y-4">
            {decoded && (
              <>
                {/* Status */}
                <div className={`${
                  decoded.isValid
                    ? isExpired()
                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                } border rounded-xl p-4`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      decoded.isValid
                        ? isExpired()
                          ? 'bg-orange-500'
                          : 'bg-green-500'
                        : 'bg-red-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">
                        {decoded.isValid ? (isExpired() ? 'Token 已过期' : 'Token 有效') : 'Token 无效'}
                      </div>
                      {!decoded.isValid && decoded.error && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          {decoded.error}
                        </div>
                      )}
                      {decoded.isValid && decoded.payload.exp && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          剩余时间: {getTimeRemaining()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowHeader(!showHeader)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-sm font-semibold">Header (头部)</h3>
                    {showHeader ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>

                  {showHeader && decoded.header && (
                    <div className="px-6 pb-4">
                      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                        <code>{prettyJSON(decoded.header)}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(prettyJSON(decoded.header))}
                        className="mt-2 w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
                      >
                        <Copy className="h-3 w-3" />
                        复制 Header
                      </button>
                    </div>
                  )}
                </div>

                {/* Payload */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowPayload(!showPayload)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h3 className="text-sm font-semibold">Payload (载荷)</h3>
                    {showPayload ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>

                  {showPayload && (
                    <div className="px-6 pb-4 space-y-4">
                      {/* Standard Claims */}
                      {decoded.isValid && (
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                            标准声明
                          </h4>

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
                                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs"
                              >
                                <span className="text-gray-600 dark:text-gray-400">{key}</span>
                                <span className="font-mono text-gray-900 dark:text-gray-100">
                                  {typeof value === 'number'
                                    ? (key.includes('Time') || key.includes('exp') || key.includes('nbf') || key.includes('iat'))
                                      ? formatDate(value)
                                      : value
                                    : String(value)}
                                </span>
                              </div>
                            )
                          ))}
                        </div>
                      )}

                      {/* Custom Claims */}
                      <div>
                        <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          完整数据
                        </h4>
                        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
                          <code>{prettyJSON(decoded.payload)}</code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(prettyJSON(decoded.payload))}
                          className="mt-2 w-full px-3 py-2 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center gap-2"
                        >
                          <Copy className="h-3 w-3" />
                          复制 Payload
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Signature */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="text-sm font-semibold mb-3">Signature (签名)</h3>
                  <div className="bg-gray-900 p-4 rounded-lg">
                    <p className="font-mono text-xs text-yellow-400 break-all">
                      {decoded.signature}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    签名用于验证 token 在传输过程中未被篡改
                  </p>
                </div>
              </>
            )}

            {!decoded && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-400 dark:text-gray-600">输入 JWT Token 开始解码</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 解码 Header 和 Payload • 验证过期时间 • 查看标准声明
          </div>
        </div>
      </div>
    </div>
  )
}
