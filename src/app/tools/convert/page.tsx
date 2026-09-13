'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Copy, Trash2, Sparkles } from 'lucide-react'
import yaml from 'js-yaml'
import xmlFormat from 'xml-formatter'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'
// @ts-ignore
const TOML = require('toml')

type FormatType = 'json' | 'xml' | 'yaml' | 'toml'

export default function DataConverterPage() {
  const { t, lang } = useI18n()
  const [input, setInput] = useState('')
  const [inputFormat, setInputFormat] = useState<FormatType>('json')
  const [outputFormat, setOutputFormat] = useState<FormatType>('yaml')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  useTransferData(setInput)

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
              throw new Error(lang === 'en' ? 'TOML parsing not supported yet — try another format' : 'TOML 解析暂不支持，请尝试其他格式')
            }
            break
        }
      } catch (err: any) {
        throw new Error(
        lang === 'en'
          ? `Parse ${inputFormat.toUpperCase()} failed: ${err.message}`
          : `解析${inputFormat.toUpperCase()}失败: ${err.message}`
      )
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
      <email>john@example.com</email>
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
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'xml', label: 'XML' },
    { value: 'toml', label: 'TOML' },
  ]

  return (
    <ToolShell
      title="DATA CONVERT"
      description={t('JSON、XML、YAML、TOML 格式互转')}
      path="/tools/convert"
      icon={RefreshCw}
      actions={
        <>
          <select
            value={inputFormat}
            onChange={(e) => setInputFormat(e.target.value as FormatType)}
            aria-label={t('输入格式')}
            className="tool-select"
          >
            {formatConfig.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>
          <span className="font-mono text-xs text-neon-purple">→</span>
          <select
            value={outputFormat}
            onChange={(e) => setOutputFormat(e.target.value as FormatType)}
            aria-label={t('输出格式')}
            className="tool-select"
          >
            {formatConfig.map((format) => (
              <option key={format.value} value={format.value}>
                {format.label}
              </option>
            ))}
          </select>

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          <button onClick={loadExample} className="tool-btn tool-btn-icon" title={t('示例')} aria-label={t('示例')}>
            <Sparkles className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={swapFormats}
            disabled={!input || !output}
            className="tool-btn tool-btn-icon tool-btn-accent"
            title={t('互换输入输出格式')}
           aria-label={t('互换')}>
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button onClick={copyToClipboard} disabled={!output} className="tool-btn tool-btn-icon tool-btn-accent" title={t('复制')} aria-label={t('复制')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={clearAll} className="tool-btn tool-btn-icon tool-btn-danger" title={t('清空')} aria-label={t('清空')}>
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {/* Workspace */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:h-[calc(100dvh-8rem)] lg:grid-rows-[minmax(0,1fr)]">
          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-purple">&gt;_</span>
              <span>INPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {inputFormat.toUpperCase()} · {input.length} {t('字符')}
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'en' ? `Enter ${inputFormat.toUpperCase()} data...` : `输入 ${inputFormat.toUpperCase()} 数据...`}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-purple placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-purple">&gt;_</span>
              <span>OUTPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {error ? (
                  <span className="text-neon-red">ERROR</span>
                ) : (
                  <>{outputFormat.toUpperCase()} · {output.length} {t('字符')}</>
                )}
              </span>
            </div>
            {error ? (
              <div className="min-h-0 flex-1 overflow-auto p-4 font-mono text-sm text-neon-red">
                {error}
              </div>
            ) : (
              <textarea
                value={output}
                readOnly
                placeholder={
                lang === 'en'
                  ? `Converted ${outputFormat.toUpperCase()} will appear here...`
                  : `转换后的 ${outputFormat.toUpperCase()} 将显示在这里...`
              }
                className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
              />
            )}
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
