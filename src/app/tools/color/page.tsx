'use client'

import { useState, useEffect } from 'react'
import { Palette, Copy } from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'

/**
 * HEX转RGB
 */
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * RGB转HEX
 */
const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

/**
 * RGB转HSL
 */
const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

/**
 * HSL转RGB
 */
const hslToRgb = (h: number, s: number, l: number) => {
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h / 60) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 60) {
    r = c
    g = x
    b = 0
  } else if (60 <= h && h < 120) {
    r = x
    g = c
    b = 0
  } else if (120 <= h && h < 180) {
    r = 0
    g = c
    b = x
  } else if (180 <= h && h < 240) {
    r = 0
    g = x
    b = c
  } else if (240 <= h && h < 300) {
    r = x
    g = 0
    b = c
  } else if (300 <= h && h < 360) {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState('#1E84FF')
  const [rgb, setRgb] = useState({ r: 30, g: 132, b: 255 })
  const [hsl, setHsl] = useState({ h: 217, s: 100, l: 56 })
  const [rgba, setRgba] = useState('rgba(30, 132, 255, 1)')

  useTransferData(setHex)

  // HEX变化时更新其他格式
  useEffect(() => {
    const rgbValue = hexToRgb(hex)
    if (rgbValue) {
      setRgb(rgbValue)
      const hslValue = rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b)
      setHsl(hslValue)
      setRgba(`rgba(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b}, 1)`)
    }
  }, [hex])

  // RGB变化时更新其他格式
  const handleRgbChange = (key: 'r' | 'g' | 'b', value: number) => {
    const newRgb = { ...rgb, [key]: Math.max(0, Math.min(255, value)) }
    setRgb(newRgb)

    const hexValue = rgbToHex(newRgb.r, newRgb.g, newRgb.b)
    setHex(hexValue)

    const hslValue = rgbToHsl(newRgb.r, newRgb.g, newRgb.b)
    setHsl(hslValue)

    setRgba(`rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, 1)`)
  }

  // HSL变化时更新其他格式
  const handleHslChange = (key: 'h' | 's' | 'l', value: number) => {
    let newValue = Math.max(0, value)
    if (key === 'h') newValue = newValue % 360
    if (key === 's' || key === 'l') newValue = Math.min(100, newValue)

    const newHsl = { ...hsl, [key]: newValue }
    setHsl(newHsl)

    const rgbValue = hslToRgb(newHsl.h, newHsl.s, newHsl.l)
    setRgb(rgbValue)

    const hexValue = rgbToHex(rgbValue.r, rgbValue.g, rgbValue.b)
    setHex(hexValue)

    setRgba(`rgba(${rgbValue.r}, ${rgbValue.g}, ${rgbValue.b}, 1)`)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <ToolShell
      title="COLOR"
      description="HEX、RGB、HSL、RGBA 颜色格式互转"
      path="/tools/color"
      icon={Palette}
      accent="lime"
    >
      {/* Color Preview */}
      <div
        className="mb-6 h-32 rounded-xl shadow-lg"
        style={{ backgroundColor: hex }}
      >
        <div className="flex items-center justify-center h-full">
          <span className="text-2xl font-bold" style={{ color: hsl.l > 50 ? '#000' : '#fff' }}>
            {hex.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* HEX */}
          <div className="panel-glow rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink-primary">HEX</h3>
              <button
                onClick={() => copyToClipboard(hex)}
                className="text-ink-muted hover:text-neon-lime"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">颜色值</label>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-full rounded-lg border border-border-dim bg-void-200 px-4 py-3 font-mono text-sm uppercase text-ink-primary focus:border-neon-lime focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">RGB</label>
                  <div className="font-mono text-sm text-ink-primary">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">HSL</label>
                  <div className="font-mono text-sm text-ink-primary">
                    hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RGB */}
          <div className="panel-glow rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink-primary">RGB</h3>
              <button
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                className="text-ink-muted hover:text-neon-lime"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">R (红)</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                    className="w-full rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">G (绿)</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                    className="w-full rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">B (蓝)</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                    className="w-full rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-lime focus:outline-none"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 font-mono text-[11px] text-ink-muted">R</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                    className="flex-1 accent-red-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 font-mono text-[11px] text-ink-muted">G</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                    className="flex-1 accent-green-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 font-mono text-[11px] text-ink-muted">B</span>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                    className="flex-1 accent-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* HSL */}
          <div className="panel-glow rounded-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-ink-primary">HSL</h3>
              <button
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                className="text-ink-muted hover:text-neon-lime"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">H (色相)</label>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => handleHslChange('h', Number(e.target.value))}
                    className="w-full rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">S (饱和度)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => handleHslChange('s', Number(e.target.value))}
                    className="w-full rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[11px] text-ink-muted">L (亮度)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => handleHslChange('l', Number(e.target.value))}
                    className="w-full rounded-lg border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary focus:border-neon-lime focus:outline-none"
                  />
                </div>
              </div>

              {/* HSL Sliders with color preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-8 font-mono text-[11px] text-ink-muted">H</span>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => handleHslChange('h', Number(e.target.value))}
                    className="flex-1"
                    style={{ background: `linear-gradient(to right, ${generateHueGradient()})` }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 font-mono text-[11px] text-ink-muted">S</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => handleHslChange('s', Number(e.target.value))}
                    className="flex-1 accent-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-8 font-mono text-[11px] text-ink-muted">L</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => handleHslChange('l', Number(e.target.value))}
                    className="flex-1 accent-gray-400"
                  />
                </div>
              </div>

              {/* Color Preview for HSL */}
              <div className="mt-4 rounded-lg border border-border-dim p-3" style={{ backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }}>
                <span className="text-sm font-medium" style={{ color: hsl.l > 50 ? '#000' : '#fff' }}>
                  HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RGBA / Additional Formats */}
        <div className="mt-4">
          <div className="panel-glow rounded-xl p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-ink-primary">其他格式</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">RGBA</label>
                <div className="flex items-center justify-between rounded bg-void-200 p-3 font-mono text-sm text-ink-primary">
                  <code>{rgba}</code>
                  <button
                    onClick={() => copyToClipboard(rgba)}
                    className="ml-2 text-ink-muted hover:text-neon-lime"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">RGB (逗号分隔)</label>
                <div className="flex items-center justify-between rounded bg-void-200 p-3 font-mono text-sm text-ink-primary">
                  <code>{rgb.r}, {rgb.g}, {rgb.b}</code>
                  <button
                    onClick={() => copyToClipboard(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                    className="ml-2 text-ink-muted hover:text-neon-lime"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">RGB (十六进制)</label>
                <div className="flex items-center justify-between rounded bg-void-200 p-3 font-mono text-sm text-ink-primary">
                  <code>rgb(0x{rgb.r.toString(16).padStart(2, '0')}, 0x{rgb.g.toString(16).padStart(2, '0')}, 0x{rgb.b.toString(16).padStart(2, '0')})</code>
                  <button
                    onClick={() => copyToClipboard(`rgb(0x${rgb.r.toString(16).padStart(2, '0')}, 0x${rgb.g.toString(16).padStart(2, '0')}, 0x${rgb.b.toString(16).padStart(2, '0')})`)}
                    className="ml-2 text-ink-muted hover:text-neon-lime"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block font-mono text-[11px] text-ink-muted">RGBA (百分比)</label>
                <div className="flex items-center justify-between rounded bg-void-200 p-3 font-mono text-sm text-ink-primary">
                  <code>rgba({Math.round((rgb.r / 255) * 100)}%, {Math.round((rgb.g / 255) * 100)}%, {Math.round((rgb.b / 255) * 100)}%, 1)</code>
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="mt-4 font-mono text-[11px] text-ink-muted">
        local only · HEX / RGB / HSL / RGBA 互转 · 实时预览 · 滑块调整
      </div>
    </ToolShell>
  )
}

// 辅助函数：生成色相梯度
function generateHueGradient(): string {
  const colors = []
  for (let i = 0; i <= 360; i += 30) {
    colors.push(`hsl(${i}, 100%, 50%)`)
  }
  return `linear-gradient(to right, ${colors.join(', ')})`
}
