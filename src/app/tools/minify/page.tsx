'use client'

import { useState, useEffect } from 'react'
import { Minimize2, Copy, Trash2, FileCode } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'

type CodeType = 'javascript' | 'css' | 'html'

export default function CodeMinifyPage() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [codeType, setCodeType] = useState<CodeType>('javascript')
  const [error, setError] = useState('')

  useTransferData(setInput)

  // Minify code
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      let result = ''

      switch (codeType) {
        case 'javascript':
          // Simple JS minification (remove comments and extra whitespace)
          result = input
            .replace(/\/\/.*$/gm, '') // Remove single-line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\s*([{}();,:])\s*/g, '$1') // Remove spaces around operators
            .trim()
          break

        case 'css':
          // Simple CSS minification
          result = input
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Replace multiple spaces
            .replace(/\s*([{}:;,>+~])\s*/g, '$1') // Remove spaces around symbols
            .trim()
          break

        case 'html':
          // Simple HTML minification
          result = input
            .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
            .replace(/\s+/g, ' ') // Replace multiple spaces
            .replace(/>\s+</g, '><') // Remove spaces between tags
            .trim()
          break
      }

      setOutput(result)
      setError('')
    } catch (err: any) {
      setError(`压缩失败: ${err.message}`)
      setOutput('')
    }
  }, [input, codeType])

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  // Clear all
  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  // Load example
  const loadExample = () => {
    const examples: Record<CodeType, string> = {
      javascript: `// This is a sample JavaScript code
function calculateSum(a, b) {
    // Add two numbers
    return a + b;
}

const result = calculateSum(10, 20);
console.log("Result:", result);`,

      css: `/* Main styles */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
}`,

      html: `<!-- Sample HTML document -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sample Page</title>
</head>
<body>
    <div class="container">
        <h1>Hello World</h1>
        <p>This is a sample paragraph.</p>
    </div>
</body>
</html>`,
    }

    setInput(examples[codeType])
  }

  // Calculate compression ratio
  const getCompressionRatio = () => {
    if (!input.length || !output.length) return 0
    return ((input.length - output.length) / input.length * 100).toFixed(1)
  }

  const codeTypes = [
    { value: 'javascript', label: 'JavaScript', icon: 'JS', color: 'from-yellow-500 to-amber-500' },
    { value: 'css', label: 'CSS', icon: 'CSS', color: 'from-blue-500 to-indigo-500' },
    { value: 'html', label: 'HTML', icon: 'HTML', color: 'from-orange-500 to-red-500' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-gray-900 rounded-lg flex items-center justify-center">
              <Minimize2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">代码压缩</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                压缩 JavaScript、CSS、HTML 代码
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Code Type Selector */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">代码类型:</span>
            <div className="flex gap-2">
              {codeTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setCodeType(type.value as CodeType)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    codeType === type.value
                      ? `bg-gradient-to-r ${type.color} text-white`
                      : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-slate-500" />
                  原始代码
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
                placeholder={`输入 ${codeType.toUpperCase()} 代码...`}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500"
                spellCheck={false}
              />

              {/* Input Stats */}
              {input && (
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>字符数: {input.length.toLocaleString()}</span>
                  <span>行数: {input.split('\n').length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Minimize2 className="h-4 w-4 text-slate-500" />
                  压缩结果
                </h3>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-800 flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    复制
                  </button>
                )}
              </div>

              {error ? (
                <div className="h-96 p-4 border border-red-300 dark:border-red-700 rounded-lg bg-red-50 dark:bg-red-900/20 overflow-auto">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : (
                <textarea
                  value={output}
                  readOnly
                  placeholder="压缩后的代码将显示在这里..."
                  className="w-full h-96 p-4 font-mono text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none"
                />
              )}

              {/* Output Stats */}
              {output && (
                <>
                  <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                    <span>字符数: {output.length.toLocaleString()}</span>
                    <span>减少: {getCompressionRatio()}%</span>
                  </div>

                  {/* Compression Stats */}
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-700 dark:text-green-400">压缩率</span>
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        {getCompressionRatio()}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${getCompressionRatio()}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-xs font-bold">JS</span>
              </div>
              <h4 className="text-sm font-semibold">JavaScript</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              移除注释、多余空格和换行，保留功能完整性
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">CSS</span>
              </div>
              <h4 className="text-sm font-semibold">CSS</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              压缩选择器、属性，优化样式表体积
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">HTML</span>
              </div>
              <h4 className="text-sm font-semibold">HTML</h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              移除注释、多余空白，缩小页面体积
            </p>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-slate-50 dark:bg-slate-900/20 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-300 mb-2">使用提示</h4>
          <ul className="text-xs text-slate-700 dark:text-slate-400 space-y-1">
            <li>• 代码压缩仅移除不必要的字符，不会改变代码功能</li>
            <li>• 压缩后的代码更难阅读，建议保存源代码用于维护</li>
            <li>• 生产环境使用压缩代码可以减少文件大小，提升加载速度</li>
            <li>• 支持实时预览压缩结果和压缩率统计</li>
          </ul>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持 JS/CSS/HTML • 实时压缩 • 压缩率统计
          </div>
        </div>
      </div>
    </div>
  )
}
