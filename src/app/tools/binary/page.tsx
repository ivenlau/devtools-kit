'use client'

import { useState, useEffect } from 'react'
import { Binary, Copy, Type } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

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
  const { t, lang } = useI18n()
  const [mode, setMode] = useState<'number' | 'text'>('number')
  const [inputType, setInputType] = useState<'dec' | 'bin' | 'hex'>('dec')
  const [input, setInput] = useState('')
  const [results, setResults] = useState({
    dec: '',
    bin: '',
    hex: '',
  })
  const [textResult, setTextResult] = useState('')

  useTransferData(setInput)

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
        setTextResult(t('转换失败'))
      }
    } else if (mode === 'text' && inputType === 'bin') {
      try {
        const result = binToString(input)
        setTextResult(result)
      } catch (error) {
        setTextResult(t('转换失败'))
      }
    }
  }, [input, inputType, mode])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <ToolShell
      title="RADIX"
      description={t('二进制、十进制、十六进制互转')}
      path="/tools/binary"
      icon={Binary}
      actions={
        <>
          <button
            onClick={() => {
              setMode('number')
              setInput('')
              setResults({ dec: '', bin: '', hex: '' })
            }}
            aria-pressed={mode === 'number'}
            title={t('数字转换')}
            aria-label={t('数字转换')}
            className={`tool-btn tool-btn-icon ${mode === 'number' ? 'tool-btn-accent' : ''}`}
          >
            <Binary className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setMode('text')
              setInput('')
              setTextResult('')
            }}
            aria-pressed={mode === 'text'}
            title={t('文本转换')}
            aria-label={t('文本转换')}
            className={`tool-btn tool-btn-icon ${mode === 'text' ? 'tool-btn-accent' : ''}`}
          >
            <Type className="h-3.5 w-3.5" />
          </button>
          {mode === 'number' ? (
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value as 'dec' | 'bin' | 'hex')
                setInput('')
                setResults({ dec: '', bin: '', hex: '' })
              }}
              aria-label={t('输入进制')}
              className="tool-select"
            >
              <option value="dec">{t('十进制 (DEC)')}</option>
              <option value="bin">{t('二进制 (BIN)')}</option>
              <option value="hex">{t('十六进制 (HEX)')}</option>
            </select>
          ) : (
            <select
              value={inputType}
              onChange={(e) => {
                setInputType(e.target.value as 'dec' | 'bin')
                setInput('')
                setTextResult('')
              }}
              aria-label={t('输入格式')}
              className="tool-select"
            >
              <option value="dec">{t('文本 (字符串)')}</option>
              <option value="bin">{t('二进制字符串')}</option>
            </select>
          )}

          <div className="hidden h-5 w-px bg-border-dim sm:block" />

          {mode === 'number'
            ? input && (
                <>
                  <button onClick={() => copyToClipboard(results.dec)} className="tool-btn">
                    <Copy className="h-3.5 w-3.5" />
                    DEC
                  </button>
                  <button onClick={() => copyToClipboard(results.bin)} className="tool-btn">
                    <Copy className="h-3.5 w-3.5" />
                    BIN
                  </button>
                  <button onClick={() => copyToClipboard(results.hex)} className="tool-btn">
                    <Copy className="h-3.5 w-3.5" />
                    HEX
                  </button>
                </>
              )
            : textResult && (
                <button onClick={() => copyToClipboard(textResult)} className="tool-btn tool-btn-icon" title={t('复制')} aria-label={t('复制')}>
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Number Mode */}
        {mode === 'number' && (
          <div className="flex flex-col gap-3">
            {/* Input */}
            <div className="tool-panel">
              <div className="tool-panel-head">
                <span className="text-neon-purple">&gt;_</span>
                <span>INPUT</span>
                <span className="ml-auto normal-case tracking-normal">
                  {inputType === 'dec' ? 'DEC' : inputType === 'bin' ? 'BIN' : 'HEX'}
                </span>
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inputType === 'dec'
                    ? t('例如: 255')
                    : inputType === 'bin'
                      ? t('例如: 11111111')
                      : t('例如: FF')
                }
                spellCheck={false}
                className="h-12 w-full bg-void-100 px-4 font-mono text-sm text-ink-primary caret-neon-purple placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            {/* Results */}
            {input && (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* DEC */}
                <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                  <h4 className="mb-2 font-mono text-[11px] text-ink-muted">{t('十进制')}</h4>
                  <code className="break-all font-mono text-lg text-neon-purple">
                    {results.dec || '-'}
                  </code>
                </div>

                {/* BIN */}
                <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                  <h4 className="mb-2 font-mono text-[11px] text-ink-muted">{t('二进制')}</h4>
                  <code className="break-all font-mono text-lg text-neon-purple">
                    {results.bin || '-'}
                  </code>
                </div>

                {/* HEX */}
                <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                  <h4 className="mb-2 font-mono text-[11px] text-ink-muted">{t('十六进制')}</h4>
                  <code className="break-all font-mono text-lg text-neon-purple">
                    {results.hex || '-'}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Text Mode */}
        {mode === 'text' && (
          <div className="flex flex-col gap-3">
            {/* Input */}
            <div className="tool-panel">
              <div className="tool-panel-head">
                <span className="text-neon-purple">&gt;_</span>
                <span>INPUT</span>
                <span className="ml-auto normal-case tracking-normal">
                  {inputType === 'dec' ? 'TEXT' : 'BIN'}
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  inputType === 'dec' ? t('输入文本...') : t('输入二进制字符串（用空格分隔字节）...')
                }
                spellCheck={false}
                className="h-36 w-full resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-purple placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            {/* Result */}
            {textResult && (
              <div className="rounded-lg border border-border-dim bg-void-100 p-4">
                <h3 className="mb-2 font-mono text-[11px] text-ink-muted">{t('转换结果')}</h3>
                <div className="rounded-md bg-void-200 p-3">
                  <code className="break-all whitespace-pre-wrap font-mono text-sm text-neon-purple">
                    {textResult}
                  </code>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Reference */}
        <div className="rounded-lg border border-border-dim bg-void-100 p-4">
          <h3 className="mb-3 font-mono text-[11px] text-ink-muted">{t('快速参考 · 常用值对照表')}</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-dim">
                  <th className="py-2 text-left font-mono text-[11px] font-normal text-ink-muted">
                    DEC
                  </th>
                  <th className="py-2 text-left font-mono text-[11px] font-normal text-ink-muted">
                    BIN
                  </th>
                  <th className="py-2 text-left font-mono text-[11px] font-normal text-ink-muted">
                    HEX
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border-dim">
                  <td className="py-2 font-mono text-ink-primary">0</td>
                  <td className="py-2 font-mono text-neon-purple">0000 0000</td>
                  <td className="py-2 font-mono text-neon-purple">0</td>
                </tr>
                <tr className="border-b border-border-dim">
                  <td className="py-2 font-mono text-ink-primary">1</td>
                  <td className="py-2 font-mono text-neon-purple">0000 0001</td>
                  <td className="py-2 font-mono text-neon-purple">1</td>
                </tr>
                <tr className="border-b border-border-dim">
                  <td className="py-2 font-mono text-ink-primary">10</td>
                  <td className="py-2 font-mono text-neon-purple">0000 1010</td>
                  <td className="py-2 font-mono text-neon-purple">A</td>
                </tr>
                <tr className="border-b border-border-dim">
                  <td className="py-2 font-mono text-ink-primary">15</td>
                  <td className="py-2 font-mono text-neon-purple">0000 1111</td>
                  <td className="py-2 font-mono text-neon-purple">F</td>
                </tr>
                <tr className="border-b border-border-dim">
                  <td className="py-2 font-mono text-ink-primary">255</td>
                  <td className="py-2 font-mono text-neon-purple">1111 1111</td>
                  <td className="py-2 font-mono text-neon-purple">FF</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
