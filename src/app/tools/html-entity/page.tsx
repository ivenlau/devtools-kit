'use client'

import { useState, useEffect } from 'react'
import { Code2, Copy, Trash2, ArrowLeftRight, Sparkles } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

type ModeType = 'encode' | 'decode'

export default function HTMLEntityPage() {
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<ModeType>('encode')

  useTransferData(setInput)

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
      setOutput(`${t('转换错误:')} ${err.message}`)
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
    { char: ' ', entity: '&nbsp;', name: '不换行空格' },
    { char: '€', entity: '&euro;', name: '欧元' },
    { char: '£', entity: '&pound;', name: '英镑' },
    { char: '¥', entity: '&yen;', name: '日元' },
  ]

  return (
    <ToolShell
      title="HTML ENTITY"
      description={t('HTML 特殊字符与实体互转')}
      path="/tools/html-entity"
      icon={Code2}
      actions={
        <>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ModeType)}
            aria-label={t('转换方向')}
            className="tool-select"
          >
            <option value="encode">{t('编码 ENCODE')}</option>
            <option value="decode">{t('解码 DECODE')}</option>
          </select>

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          <button onClick={loadExample} className="tool-btn tool-btn-icon" title={t('示例')} aria-label={t('示例')}>
            <Sparkles className="h-3.5 w-3.5" />
          </button>
          <button onClick={copyToClipboard} disabled={!output} className="tool-btn tool-btn-icon tool-btn-accent" title={t('复制')} aria-label={t('复制')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={swapMode} className="tool-btn tool-btn-icon" title={t('互换模式')} aria-label={t('互换')}>
            <ArrowLeftRight className="h-3.5 w-3.5" />
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
              <span className="text-neon-amber">&gt;_</span>
              <span>INPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {mode === 'encode' ? t('原始文本') : t('HTML 实体')} · {input.length} {t('字符')}
              </span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encode' ? t('输入包含特殊字符的文本...') : t('输入 HTML 实体...')}
              spellCheck={false}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-amber placeholder:text-ink-muted focus:outline-none"
            />
          </div>

          <div className="tool-panel h-full min-h-[400px]">
            <div className="tool-panel-head">
              <span className="text-neon-amber">&gt;_</span>
              <span>OUTPUT</span>
              <span className="ml-auto normal-case tracking-normal">
                {mode === 'encode' ? t('HTML 实体') : t('解码结果')} · {output.length} {t('字符')}
              </span>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder={mode === 'encode' ? t('HTML 实体将显示在这里...') : t('解码结果将显示在这里...')}
              className="min-h-0 flex-1 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none"
            />
          </div>
        </div>

        {/* Common entities reference */}
        <div className="border-t border-border-dim pt-3">
          <div className="mb-2 font-mono text-[11px] text-ink-muted">
            {t('常用 HTML 实体 · 点击填入输入框')}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {commonEntities.map((entity) => (
              <button
                key={entity.char}
                onClick={() => {
                  setInput(mode === 'encode' ? entity.char : entity.entity)
                }}
                title={t(entity.name)}
                className="rounded-md border border-border-dim bg-void-200 px-2.5 py-1.5 text-left transition-colors hover:border-neon-amber/70"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm text-neon-amber">{entity.char}</span>
                  <span className="truncate font-mono text-[10px] text-ink-muted">{entity.entity}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
