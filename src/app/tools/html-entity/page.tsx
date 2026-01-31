'use client'

import { useState, useEffect } from 'react'
import { Code2, Copy, Trash2, ArrowLeftRight } from 'lucide-react'

type ModeType = 'encode' | 'decode'

export default function HTMLEntityPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<ModeType>('encode')

  // HTML Entity conversion
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      let result = ''

      if (mode === 'encode') {
        result = encodeHTMLEntities(input)
      } else {
        result = decodeHTMLEntities(input)
      }

      setOutput(result)
    } catch (err: any) {
      setOutput(`转换错误: ${err.message}`)
    }
  }, [input, mode])

  // Encode HTML entities
  const encodeHTMLEntities = (text: string): string => {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '©': '&copy;',
      '®': '&reg;',
      '™': '&trade;',
      '€': '&euro;',
      '£': '&pound;',
      '¥': '&yen;',
      '¢': '&cent;',
      '§': '&sect;',
      '¶': '&para;',
      '…': '&hellip;',
      '—': '&mdash;',
      '–': '&ndash;',
      '«': '&laquo;',
      '»': '&raquo;',
      '°': '&deg;',
      '±': '&plusmn;',
      '×': '&times;',
      '÷': '&divide;',
      '√': '&radic;',
      '∞': '&infin;',
      '≈': '&asymp;',
      '≠': '&ne;',
      '≤': '&le;',
      '≥': '&ge;',
    }

    return text.replace(/[&<>"'©®™€£¥¢§¶…—–«»°±×÷√∞≈≠≤≥]/g, (char) => {
      return htmlEntities[char] || char
    })
  }

  // Decode HTML entities
  const decodeHTMLEntities = (text: string): string => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  // Load example
  const loadExample = () => {
    if (mode === 'encode') {
      setInput('<div class="container">\n  <h1>Hello "World" & Friends</h1>\n  <p>© 2024 Company®</p>\n</div>')
    } else {
      setInput('&lt;div class=&quot;container&quot;&gt;\n  &lt;h1&gt;Hello &quot;World&quot; &amp; Friends&lt;/h1&gt;\n  &lt;p&gt;&copy; 2024 Company&amp;reg;&lt;/p&gt;\n&lt;/div&gt;')
    }
  }

  // Swap mode
  const swapMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    if (output) {
      setInput(output)
    }
  }

  // Common HTML entities reference
  const commonEntities = [
    { char: '<', entity: '&lt;', name: '小于号' },
    { char: '>', entity: '&gt;', name: '大于号' },
    { char: '&', entity: '&amp;', name: '和号' },
    { char: '"', entity: '&quot;', name: '双引号' },
    { char: "'", entity: '&#39;', name: '单引号' },
    { char: '©', entity: '&copy;', name: '版权' },
    { char: '®', entity: '&reg;', name: '注册商标' },
    { char: '™', entity: '&trade;', name: '商标' },
    { char: ' ', entity: '&nbsp;', name: '不换行空格' },
    { char: '€', entity: '&euro;', name: '欧元' },
    { char: '£', entity: '&pound;', name: '英镑' },
    { char: '¥', entity: '&yen;', name: '日元' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Code2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">HTML 实体编解码</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                HTML 特殊字符与实体互转
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Mode Selector */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMode('encode')}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                  mode === 'encode'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                编码
              </button>
              <button
                onClick={() => setMode('decode')}
                className={`px-6 py-3 text-sm font-medium rounded-lg transition-all ${
                  mode === 'decode'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                解码
              </button>
            </div>

            <button
              onClick={swapMode}
              className="p-3 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
              title="互换模式"
            >
              <ArrowLeftRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {mode === 'encode' ? '将特殊字符转换为 HTML 实体' : '将 HTML 实体转换回原始字符'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">
                  {mode === 'encode' ? '原始文本' : 'HTML 实体'}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={loadExample}
                    className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    加载示例
                  </button>
                  {input && (
                    <button
                      onClick={clearAll}
                      className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      清空
                    </button>
                  )}
                </div>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'encode' ? '输入包含特殊字符的文本...' : '输入 HTML 实体...'}
                className="w-full h-80 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold">
                  {mode === 'encode' ? 'HTML 实体' : '解码结果'}
                </h3>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    复制
                  </button>
                )}
              </div>

              <textarea
                value={output}
                readOnly
                placeholder={mode === 'encode' ? 'HTML 实体将显示在这里...' : '解码结果将显示在这里...'}
                className="w-full h-80 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none"
              />

              {/* Character count */}
              {output && (
                <div className="mt-3 text-xs text-gray-500">
                  {output.length} 个字符
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Common Entities Reference */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">常用 HTML 实体</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {commonEntities.map((entity) => (
              <button
                key={entity.char}
                onClick={() => {
                  setInput(mode === 'encode' ? entity.char : entity.entity)
                }}
                className="p-3 bg-gray-50 dark:bg-gray-900 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg text-orange-600 dark:text-orange-400">{entity.char}</span>
                </div>
                <div className="font-mono text-xs text-gray-600 dark:text-gray-400 mb-1">
                  {entity.entity}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {entity.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-300 mb-2">使用提示</h4>
          <ul className="text-xs text-orange-700 dark:text-orange-400 space-y-1">
            <li>• HTML 实体用于在 HTML 中显示特殊字符（如 &lt; 表示 &lt;）</li>
            <li>• 编码模式：将特殊字符转换为 HTML 实体，安全显示在网页中</li>
            <li>• 解码模式：将 HTML 实体转换回原始字符</li>
            <li>• 点击常用实体卡片可快速填入输入框</li>
          </ul>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 实时编解码 • 常用实体参考 • 一键模式互换
          </div>
        </div>
      </div>
    </div>
  )
}
