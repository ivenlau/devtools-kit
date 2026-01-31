'use client'

import { useState, useEffect } from 'react'
import { Hash, Copy } from 'lucide-react'

/**
 * 十进制转二进制
 */
const decToBin = (dec: string): string => {
  const num = parseInt(dec, 10)
  if (isNaN(num)) return ''
  return num.toString(2)
}

/**
 * 二进制转十进制
 */
const binToDec = (bin: string): string => {
  const num = parseInt(bin, 2)
  if (isNaN(num)) return ''
  return num.toString(10)
}

/**
 * 十进制转十六进制
 */
const decToHex = (dec: string): string => {
  const num = parseInt(dec, 10)
  if (isNaN(num)) return ''
  return num.toString(16).toUpperCase()
}

/**
 * 十六进制转十进制
 */
const hexToDec = (hex: string): string => {
  const num = parseInt(hex, 16)
  if (isNaN(num)) return ''
  return num.toString(10)
}

/**
 * 二进制转十六进制
 */
const binToHex = (bin: string): string => {
  const dec = binToDec(bin)
  if (!dec) return ''
  return decToHex(dec)
}

/**
 * 十六进制转二进制
 */
const hexToBin = (hex: string): string => {
  const dec = hexToDec(hex)
  if (!dec) return ''
  return decToBin(dec)
}

/**
 * 字符串转二进制
 */
const stringToBin = (str: string): string => {
  return str.split('').map(char => {
    const bin = char.charCodeAt(0).toString(2)
    return bin.padStart(8, '0')
  }).join(' ')
}

/**
 * 二进制转字符串
 */
const binToString = (bin: string): string => {
  const bytes = bin.split(' ').filter(b => b.length > 0)
  return bytes.map(byte => String.fromCharCode(parseInt(byte, 2))).join('')
}

export default function BinaryConverterPage() {
  const [mode, setMode] = useState<'number' | 'text'>('number')
  const [inputType, setInputType] = useState<'dec' | 'bin' | 'hex'>('dec')
  const [input, setInput] = useState('')
  const [results, setResults] = useState({
    dec: '',
    bin: '',
    hex: '',
  })
  const [textResult, setTextResult] = useState('')

  // 数字转换
  useEffect(() => {
    if (!input.trim()) {
      setResults({ dec: '', bin: '', hex: '' })
      return
    }

    switch (inputType) {
      case 'dec':
        setResults({
          dec: input,
          bin: decToBin(input),
          hex: decToHex(input),
        })
        break
      case 'bin':
        setResults({
          dec: binToDec(input),
          bin: input,
          hex: binToHex(input),
        })
        break
      case 'hex':
        setResults({
          dec: hexToDec(input),
          bin: hexToBin(input),
          hex: input,
        })
        break
    }
  }, [input, inputType])

  // 文本转换
  useEffect(() => {
    if (!input.trim()) {
      setTextResult('')
      return
    }

    if (mode === 'text' && inputType === 'dec') {
      try {
        const result = stringToBin(input)
        setTextResult(result)
      } catch (error) {
        setTextResult('转换失败')
      }
    } else if (mode === 'text' && inputType === 'bin') {
      try {
        const result = binToString(input)
        setTextResult(result)
      } catch (error) {
        setTextResult('转换失败')
      }
    }
  }, [input, inputType, mode])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Hash className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">进制转换器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                二进制、十进制、十六进制互转
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Mode Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMode('number')
                setInput('')
                setResults({ dec: '', bin: '', hex: '' })
              }}
              className={`px-6 py-3 font-medium transition-all text-sm border-b-2 ${
                mode === 'number'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              数字转换
            </button>
            <button
              onClick={() => {
                setMode('text')
                setInput('')
                setTextResult('')
              }}
              className={`px-6 py-3 font-medium transition-all text-sm border-b-2 ${
                mode === 'text'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              文本转换
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Number Mode */}
        {mode === 'number' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Input Type Selector */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">选择输入进制</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setInputType('dec')
                    setInput('')
                    setResults({ dec: '', bin: '', hex: '' })
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    inputType === 'dec'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200'
                  }`}
                >
                  十进制 (DEC)
                </button>
                <button
                  onClick={() => {
                    setInputType('bin')
                    setInput('')
                    setResults({ dec: '', bin: '', hex: '' })
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    inputType === 'bin'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200'
                  }`}
                >
                  二进制 (BIN)
                </button>
                <button
                  onClick={() => {
                    setInputType('hex')
                    setInput('')
                    setResults({ dec: '', bin: '', hex: '' })
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all ${
                    inputType === 'hex'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200'
                  }`}
                >
                  十六进制 (HEX)
                </button>
              </div>
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  输入 {inputType === 'dec' ? '十进制' : inputType === 'bin' ? '二进制' : '十六进制'}
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={inputType === 'dec' ? '例如: 255' : inputType === 'bin' ? '例如: 11111111' : '例如: FF'}
                  className="w-full px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Results */}
            {input && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* DEC */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">十进制</h4>
                    <button
                      onClick={() => copyToClipboard(results.dec)}
                      className="text-gray-400 hover:text-emerald-500"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <code className="text-lg">{results.dec || '-'}</code>
                </div>

                {/* BIN */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">二进制</h4>
                    <button
                      onClick={() => copyToClipboard(results.bin)}
                      className="text-gray-400 hover:text-emerald-500"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <code className="text-lg break-all">{results.bin || '-'}</code>
                </div>

                {/* HEX */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">十六进制</h4>
                    <button
                      onClick={() => copyToClipboard(results.hex)}
                      className="text-gray-400 hover:text-emerald-500"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <code className="text-lg">{results.hex || '-'}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                  输入格式
                </label>
                <select
                  value={inputType}
                  onChange={(e) => {
                    setInputType(e.target.value as 'dec' | 'bin')
                    setInput('')
                    setTextResult('')
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="dec">文本 (字符串)</option>
                  <option value="bin">二进制字符串</option>
                </select>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={inputType === 'dec' ? '输入文本...' : '输入二进制字符串（用空格分隔字节）...'}
                className="w-full h-40 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                spellCheck={false}
              />
            </div>

            {/* Result */}
            {textResult && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    转换结果
                  </h3>
                  <button
                    onClick={() => copyToClipboard(textResult)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    复制
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <code className="text-sm break-all whitespace-pre-wrap">{textResult}</code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Reference */}
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">快速参考</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">十进制 (DEC)</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>0-9</li>
                  <li>日常使用最广泛</li>
                  <li>人类可读</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">二进制 (BIN)</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>0-1</li>
                  <li>计算机内部使用</li>
                  <li>机器语言</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">十六进制 (HEX)</h4>
                <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                  <li>0-9, A-F</li>
                  <li>更紧凑的表示</li>
                  <li>常用于内存地址</li>
                </ul>
              </div>
            </div>

            {/* Common Values */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">常用值对照表</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="py-2 text-left text-gray-600 dark:text-gray-400">DEC</th>
                      <th className="py-2 text-left text-gray-600 dark:text-gray-400">BIN</th>
                      <th className="py-2 text-left text-gray-600 dark:text-gray-400">HEX</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">0</td>
                      <td className="py-2 font-mono text-emerald-600">0000 0000</td>
                      <td className="py-2 font-mono text-emerald-600">0</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">1</td>
                      <td className="py-2 font-mono text-emerald-600">0000 0001</td>
                      <td className="py-2 font-mono text-emerald-600">1</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">10</td>
                      <td className="py-2 font-mono text-emerald-600">0000 1010</td>
                      <td className="py-2 font-mono text-emerald-600">A</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">15</td>
                      <td className="py-2 font-mono text-emerald-600">0000 1111</td>
                      <td className="py-2 font-mono text-emerald-600">F</td>
                    </tr>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2">255</td>
                      <td className="py-2 font-mono text-emerald-600">1111 1111</td>
                      <td className="py-2 font-mono text-emerald-600">FF</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持数字转换和文本转换 • 实时双向转换 • 完整的进制对照表
          </div>
        </div>
      </div>
    </div>
  )
}
