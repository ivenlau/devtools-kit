'use client'

import { useState, useEffect } from 'react'
import { Minimize2, Copy, Trash2, Sparkles } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

type CodeType = 'javascript' | 'css' | 'html'

export default function CodeMinifyPage() {
  const { t, lang } = useI18n()
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
    { value: 'javascript', label: 'JavaScript' },
    { value: 'css', label: 'CSS' },
    { value: 'html', label: 'HTML' },
  ]

  return (
    <ToolShell
      title="CODE MINIFY"
      description={t('压缩 JavaScript、CSS、HTML 代码')}
      path="/tools/minify"
      icon={Minimize2}
      accent="lime"
      actions={
        <>
          <select
            value={codeType}
            onChange={(e) => setCodeType(e.target.value as CodeType)}
            aria-label={t('代码类型')}
            className="tool-select"
          >
            {codeTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <button onClick={loadExample} className="tool-btn tool-btn-icon" title={t('示例')} aria-label={t('示例')}>
            <Sparkles className="h-3.5 w-3.5" />
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
              <span className="text-neon-lime">&gt;_</span>
              <span>INPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {input.length.toLocaleString()} {t('字符')} · {input.split('\n').length} {t('行')}
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={lang === 'en' ? `Enter ${codeType.toUpperCase()} code...` : `输入 ${codeType.toUpperCase()} 代码...`}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-lime placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-lime">&gt;_</span>
              <span>OUTPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {error ? (
                  <span className="text-neon-red">ERROR</span>
                ) : (
                  <>
                    {output.length.toLocaleString()} {t('字符')} · {t('减少')} {getCompressionRatio()}%
                  </>
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
                placeholder={t('压缩后的代码将显示在这里...')}
                className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-xs text-ink-primary placeholder:text-ink-muted focus:outline-none"
              />
            )}
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
