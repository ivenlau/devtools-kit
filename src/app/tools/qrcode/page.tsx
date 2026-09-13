'use client'

import { useState, useEffect } from 'react'
import { QrCode, Copy, Download, Image as ImageIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'

export default function QRCodeGeneratorPage() {
  const { t } = useI18n()
  const [text, setText] = useState('https://github.com')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  useTransferData(setText)

  // 预览卡片 p-4 的边框留白宽度，导出图与预览保持一致
  const PLATE_PAD = 16

  // 把二维码 SVG 包进带背景色边框的完整 plate（与预览一致）
  const buildPlateSvg = (svg: SVGSVGElement): string => {
    const inner = new XMLSerializer().serializeToString(svg)
    const total = size + PLATE_PAD * 2
    const withPos = inner.replace('<svg', `<svg x="${PLATE_PAD}" y="${PLATE_PAD}"`)
    return (
      `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${total}" viewBox="0 0 ${total} ${total}">` +
      `<rect width="${total}" height="${total}" fill="${bgColor}"/>` +
      withPos +
      `</svg>`
    )
  }

  // 下载QR码
  const downloadQRCode = () => {
    const svg = document.querySelector<SVGSVGElement>('#qrcode-svg')
    if (!svg) return

    // 将 plate SVG 转换为 Canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    const svgBlob = new Blob([buildPlateSvg(svg)], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      const total = size + PLATE_PAD * 2
      canvas.width = total
      canvas.height = total
      ctx?.drawImage(img, 0, 0)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.href = pngUrl
      link.download = `qrcode-${Date.now()}.png`
      link.click()
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  // 复制Base64
  const copyBase64 = () => {
    const svg = document.querySelector<SVGSVGElement>('#qrcode-svg')
    if (!svg) return

    const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(buildPlateSvg(svg))))}`
    navigator.clipboard.writeText(base64)
  }

  return (
    <ToolShell
      title="QRCODE"
      description={t('生成自定义二维码，支持多种格式')}
      path="/tools/qrcode"
      icon={QrCode}
      accent="cyan"
      actions={
        <>
          <button onClick={copyBase64} className="tool-btn tool-btn-icon" title={t('复制B64')} aria-label={t('复制B64')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={downloadQRCode} className="tool-btn tool-btn-icon tool-btn-accent" title={t('下载 PNG')} aria-label={t('下载 PNG')}>
            <Download className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {/* Input + Options */}
          <div className="flex min-h-0 flex-col gap-3">
            {/* Content */}
            <div className="tool-panel">
              <div className="tool-panel-head">
                <span className="text-neon-cyan">&gt;_</span>
                <span>INPUT</span>
                <span className="ml-auto normal-case tracking-normal">{text.length} {t('字符')}</span>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('输入文本或URL...')}
                spellCheck={false}
                className="h-32 w-full min-h-0 resize-none bg-void-100 p-4 font-mono text-sm text-ink-primary caret-neon-cyan placeholder:text-ink-muted focus:outline-none"
              />
            </div>

            {/* Options */}
            <div className="tool-panel">
              <div className="tool-panel-head">
                <span className="text-neon-cyan">&gt;_</span>
                <span>OPTIONS</span>
                <span className="ml-auto normal-case tracking-normal">
                  {size}px · level {errorCorrection}
                </span>
              </div>
              <div className="space-y-4 p-4">
                {/* Size */}
                <div>
                  <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                    {t('尺寸:')} {size}px × {size}px
                  </label>
                  <input
                    type="range"
                    min={128}
                    max={512}
                    step={32}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-neon-cyan"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                      {t('前景色')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border-dim bg-void-200 p-1"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        spellCheck={false}
                        className="w-full min-w-0 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm uppercase text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                      {t('背景色')}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border-dim bg-void-200 p-1"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        spellCheck={false}
                        className="w-full min-w-0 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm uppercase text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Correction */}
                <div>
                  <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                    {t('容错率')}
                  </label>
                  <div className="flex gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setErrorCorrection(level)}
                        className={`chip flex-1 justify-center ${errorCorrection === level ? 'chip-active' : ''}`}
                      >
                        {level} ({level === 'L' ? '7%' : level === 'M' ? '15%' : level === 'Q' ? '25%' : '30%'})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Sizes */}
                <div>
                  <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                    {t('快速尺寸')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[128, 256, 384, 512].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`chip ${size === s ? 'chip-active' : ''}`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="tool-panel">
            <div className="tool-panel-head">
              <span className="text-neon-cyan">&gt;_</span>
              <span>PREVIEW</span>
              <span className="ml-auto normal-case tracking-normal">
                {size} × {size}px
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 p-6">
              {/* QR Code — white plate kept for scannability */}
              <div
              className="rounded-lg border border-border-glow p-4 shadow-panel"
              style={{ backgroundColor: bgColor }}
            >
                <QRCodeSVG
                  id="qrcode-svg"
                  value={text}
                  size={size}
                  fgColor={color}
                  bgColor={bgColor}
                  level={errorCorrection}
                />
              </div>

              {/* Color Info */}
              <div className="space-y-2 text-center text-sm">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 rounded border border-border-dim" style={{ backgroundColor: color }}></span>
                  <span className="font-mono text-xs text-ink-secondary">{t('前景色')} {color.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 rounded border border-border-dim" style={{ backgroundColor: bgColor }}></span>
                  <span className="font-mono text-xs text-ink-secondary">{t('背景色')} {bgColor.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon className="h-4 w-4 text-ink-muted" />
                  <span className="font-mono text-xs text-ink-secondary">{size} × {size}px · PNG / Base64</span>
                </div>
              </div>

              {/* Content Preview */}
              {text && text.length <= 50 && (
                <div className="w-full rounded-md bg-void-200 p-3">
                  <p className="break-all font-mono text-xs text-ink-secondary">
                    {text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </ToolShell>
  )
}
