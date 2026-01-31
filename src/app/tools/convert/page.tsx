'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Copy, Trash2, FileCode } from 'lucide-react'
import yaml from 'js-yaml'
import { format as xmlFormat } from 'xml-formatter'
// @ts-ignore
const TOML = require('toml')

type FormatType = 'json' | 'xml' | 'yaml' | 'toml'

export default function DataConverterPage() {
  const [input, setInput] = useState('')
  const [inputFormat, setInputFormat] = useState<FormatType>('json')
  const [outputFormat, setOutputFormat] = useState<FormatType>('yaml')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  // Convert data
  useEffect(() => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      // Parse input
      let data: any
      try {
        switch (inputFormat) {
          case 'json':
            data = JSON.parse(input)
            break
          case 'yaml':
            data = yaml.load(input)
            break
          case 'xml':
            // Simple XML to JSON conversion
            const parseXML = (text: string) => {
              const result: any = {}
              const tags = text.match(/<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g)
              if (tags) {
                tags.forEach((tag) => {
                  const match = tag.match(/<(\w+)([^>]*)>([\s\S]*?)<\/\1>/)
                  if (match) {
                    const [, tagName, attrs, content] = match
                    if (!result[tagName]) result[tagName] = []
                    result[tagName].push({
                      ...(attrs && { _attributes: attrs }),
                      ...(content && { _text: content.trim() }),
                    })
                  }
                })
              }
              return result
            }
            data = parseXML(input)
            break
          case 'toml':
            try {
              // @ts-ignore
              data = TOML.parse(input)
            } catch {
              throw new Error('TOML 解析暂不支持，请尝试其他格式')
            }
            break
        }
      } catch (err: any) {
        throw new Error(`解析${inputFormat.toUpperCase()}失败: ${err.message}`)
      }

      // Stringify output
      let result = ''
      switch (outputFormat) {
        case 'json':
          result = JSON.stringify(data, null, 2)
          break
        case 'yaml':
          result = yaml.dump(data, { indent: 2, lineWidth: -1 })
          break
        case 'xml':
          // Simple JSON to XML conversion
          const toXML = (obj: any, rootName = 'root'): string => {
            let xml = ''

            if (Array.isArray(obj)) {
              obj.forEach((item) => {
                const key = Object.keys(item)[0]
                xml += `<${key}>`
                if (typeof item[key] === 'object') {
                  xml += toXML(item[key])
                } else {
                  xml += item[key]
                }
                xml += `</${key}>`
              })
            } else if (typeof obj === 'object' && obj !== null) {
              Object.keys(obj).forEach((key) => {
                xml += `<${key}>`
                if (Array.isArray(obj[key])) {
                  xml += toXML(obj[key])
                } else if (typeof obj[key] === 'object') {
                  xml += toXML(obj[key], key)
                } else {
                  xml += obj[key]
                }
                xml += `</${key}>`
              })
            } else {
              xml += String(obj)
            }

            return xml
          }

          const xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n${toXML(data)}`
          try {
            result = xmlFormat(xmlString, { collapseContent: true })
          } catch {
            result = xmlString
          }
          break
        case 'toml':
          // Simple TOML generation
          try {
            // @ts-ignore
            result = TOML.stringify(data)
          } catch {
            // Fallback: simple TOML generator
            result = generateTOML(data)
          }
          break
      }

      setOutput(result)
      setError('')
    } catch (err: any) {
      setError(err.message)
      setOutput('')
    }
  }, [input, inputFormat, outputFormat])

  // Simple TOML generator fallback
  const generateTOML = (obj: any): string => {
    let result = ''

    if (!obj || typeof obj !== 'object') {
      return result
    }

    Object.keys(obj).forEach((key) => {
      const value = obj[key]

      if (typeof value === 'string') {
        result += `${key} = "${value}"\n`
      } else if (typeof value === 'number') {
        result += `${key} = ${value}\n`
      } else if (typeof value === 'boolean') {
        result += `${key} = ${value}\n`
      } else if (Array.isArray(value)) {
        // Check if it's an array of objects
        if (value.length > 0 && typeof value[0] === 'object') {
          // Array of objects - expand as [[key]] blocks
          value.forEach((item) => {
            result += `[[${key}]]\n`
            Object.keys(item).forEach((itemKey) => {
              const itemValue = item[itemKey]
              if (typeof itemValue === 'string') {
                result += `  ${itemKey} = "${itemValue}"\n`
              } else if (typeof itemValue === 'number') {
                result += `  ${itemKey} = ${itemValue}\n`
              } else if (typeof itemValue === 'boolean') {
                result += `  ${itemKey} = ${itemValue}\n`
              }
            })
            result += '\n'
          })
        } else if (value.length > 0) {
          // Array of primitives
          const items = value.map((v) =>
            typeof v === 'string' ? `"${v}"` : String(v)
          )
          result += `${key} = [${items.join(', ')}]\n`
        }
        // Empty array - skip
      } else if (typeof value === 'object' && value !== null) {
        // Nested object - inline as table
        const pairs = Object.keys(value).map((k) => {
          const v = value[k]
          if (typeof v === 'string') {
            return `${k} = "${v}"`
          } else if (typeof v === 'number') {
            return `${k} = ${v}`
          } else if (typeof v === 'boolean') {
            return `${k} = ${v}`
          }
          return `${k} = null`
        })
        result += `${key} = { ${pairs.join(', ')} }\n`
      }
    })

    return result
  }

  // Swap formats
  const swapFormats = () => {
    const tempFormat = inputFormat
    setInputFormat(outputFormat)
    setOutputFormat(tempFormat)
    setInput(output)
  }

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
    const examples: Record<FormatType, string> = {
      json: JSON.stringify(
        {
          users: [
            { id: 1, name: 'John', email: 'john@example.com' },
            { id: 2, name: 'Jane', email: 'jane@example.com' },
          ],
          count: 2,
        },
        null,
        2
      ),
      yaml: `users:
  - id: 1
    name: John
    email: john@example.com
  - id: 2
    name: Jane
    email: jane@example.com
count: 2`,
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <users>
    <user>
      <id>1</id>
      <name>John</name>
      <email>john@example.com</email>
    </user>
    <user>
      <id>2</id>
      <name>Jane</name>
      <email>jane@example.com</email>
    </user>
  </users>
  <count>2</count>
</root>`,
      toml: `# Example TOML
count = 2

[[users]]
id = 1
name = "John"
email = "john@example.com"

[[users]]
id = 2
name = "Jane"
email = "jane@example.com"`,
    }

    setInput(examples[inputFormat])
  }

  const formatConfig = [
    { value: 'json', label: 'JSON', icon: '{}', color: 'from-amber-500 to-orange-500' },
    { value: 'yaml', label: 'YAML', icon: 'Y', color: 'from-red-500 to-pink-500' },
    { value: 'xml', label: 'XML', icon: '<>', color: 'from-blue-500 to-cyan-500' },
    { value: 'toml', label: 'TOML', icon: 'T', color: 'from-purple-500 to-violet-500' },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">数据格式转换</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                JSON、XML、YAML、TOML 格式互转
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Format Selector */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-4">
            {/* Input Format */}
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                输入格式
              </label>
              <div className="flex gap-2 justify-center">
                {formatConfig.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setInputFormat(format.value as FormatType)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      inputFormat === format.value
                        ? `bg-gradient-to-r ${format.color} text-white`
                        : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Swap Button */}
            <button
              onClick={swapFormats}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all"
              disabled={!input || !output}
            >
              <RefreshCw className="h-5 w-5" />
            </button>

            {/* Output Format */}
            <div className="flex-1">
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                输出格式
              </label>
              <div className="flex gap-2 justify-center">
                {formatConfig.map((format) => (
                  <button
                    key={format.value}
                    onClick={() => setOutputFormat(format.value as FormatType)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      outputFormat === format.value
                        ? `bg-gradient-to-r ${format.color} text-white`
                        : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                    }`}
                  >
                    {format.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-violet-500" />
                  输入 ({inputFormat.toUpperCase()})
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
                placeholder={`输入 ${inputFormat.toUpperCase()} 数据...`}
                className="w-full h-96 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Right Column - Output */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-violet-500" />
                  输出 ({outputFormat.toUpperCase()})
                </h3>
                {output && (
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-xs bg-violet-500 text-white rounded hover:bg-violet-600 flex items-center gap-1"
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
                  placeholder={`转换后的 ${outputFormat.toUpperCase()} 将显示在这里...`}
                  className="w-full h-96 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Conversion Matrix */}
        <div className="mt-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4">支持的转换</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 w-32">
                    FROM \ TO
                  </th>
                  {['JSON', 'YAML', 'XML', 'TOML'].map((format) => (
                    <th key={format} className="px-4 py-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                      {format}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['JSON', 'YAML', 'XML', 'TOML'].map((fromFormat) => (
                  <tr key={fromFormat} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-2 text-xs font-semibold text-gray-900 dark:text-gray-100">
                      {fromFormat}
                    </td>
                    {['JSON', 'YAML', 'XML', 'TOML'].map((toFormat) => (
                      <td key={toFormat} className="px-4 py-2 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded text-xs ${
                            fromFormat === toFormat
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                              : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          }`}
                        >
                          {fromFormat === toFormat ? '—' : '✓'}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="mt-6 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-violet-800 dark:text-violet-300 mb-2">使用提示</h4>
          <ul className="text-xs text-violet-700 dark:text-violet-400 space-y-1">
            <li>• 支持 JSON ↔ YAML ↔ XML ↔ TOML 双向转换</li>
            <li>• 转换过程中自动格式化输出</li>
            <li>• 点击中间按钮可快速互换输入输出格式</li>
            <li>• 支持复杂嵌套数据结构</li>
          </ul>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 JSON ↔ YAML ↔ XML ↔ TOML • 一键格式互换 • 实时转换
          </div>
        </div>
      </div>
    </div>
  )
}
