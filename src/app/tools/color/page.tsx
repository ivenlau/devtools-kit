'use client'

import { useState, useEffect } from 'react'
import { Palette, Copy } from 'lucide-react'

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">颜色转换器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                HEX、RGB、HSL、RGBA 颜色格式互转
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Color Preview */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div
            className="h-32 rounded-xl shadow-lg"
            style={{ backgroundColor: hex }}
          >
            <div className="flex items-center justify-center h-full">
              <span className="text-2xl font-bold" style={{ color: hsl.l > 50 ? '#000' : '#fff' }}>
                {hex.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* HEX */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">HEX</h3>
              <button
                onClick={() => copyToClipboard(hex)}
                className="text-gray-400 hover:text-pink-500"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  颜色值
                </label>
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-full px-4 py-3 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 uppercase"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">RGB</label>
                  <div className="text-sm font-mono">
                    rgb({rgb.r}, {rgb.g}, {rgb.b})
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">HSL</label>
                  <div className="text-sm font-mono">
                    hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RGB */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">RGB</h3>
              <button
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                className="text-gray-400 hover:text-pink-500"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">R (红)</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.r}
                    onChange={(e) => handleRgbChange('r', Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">G (绿)</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.g}
                    onChange={(e) => handleRgbChange('g', Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">B (蓝)</label>
                  <input
                    type="number"
                    min={0}
                    max={255}
                    value={rgb.b}
                    onChange={(e) => handleRgbChange('b', Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-3">R</span>
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
                  <span className="text-xs text-gray-500 w-3">G</span>
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
                  <span className="text-xs text-gray-500 w-3">B</span>
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
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">HSL</h3>
              <button
                onClick={() => copyToClipboard(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                className="text-gray-400 hover:text-pink-500"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">H (色相)</label>
                  <input
                    type="number"
                    min={0}
                    max={360}
                    value={hsl.h}
                    onChange={(e) => handleHslChange('h', Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">S (饱和度)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.s}
                    onChange={(e) => handleHslChange('s', Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">L (亮度)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={hsl.l}
                    onChange={(e) => handleHslChange('l', Number(e.target.value))}
                    className="w-full px-3 py-2 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>

              {/* HSL Sliders with color preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-8">H</span>
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
                  <span className="text-xs text-gray-500 w-8">S</span>
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
                  <span className="text-xs text-gray-500 w-8">L</span>
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
              <div className="mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-600" style={{ backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` }}>
                <span className="text-sm font-medium" style={{ color: hsl.l > 50 ? '#000' : '#fff' }}>
                  HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RGBA / Additional Formats */}
        <div className="mt-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">其他格式</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">RGBA</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm flex items-center justify-between">
                  <code>{rgba}</code>
                  <button
                    onClick={() => copyToClipboard(rgba)}
                    className="ml-2 text-gray-400 hover:text-pink-500"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">RGB (逗号分隔)</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm flex items-center justify-between">
                  <code>{rgb.r}, {rgb.g}, {rgb.b}</code>
                  <button
                    onClick={() => copyToClipboard(`${rgb.r}, ${rgb.g}, ${rgb.b}`)}
                    className="ml-2 text-gray-400 hover:text-pink-500"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">RGB (十六进制)</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm flex items-center justify-between">
                  <code>rgb(0x{rgb.r.toString(16).padStart(2, '0')}, 0x{rgb.g.toString(16).padStart(2, '0')}, 0x{rgb.b.toString(16).padStart(2, '0')})</code>
                  <button
                    onClick={() => copyToClipboard(`rgb(0x${rgb.r.toString(16).padStart(2, '0')}, 0x${rgb.g.toString(16).padStart(2, '0')}, 0x${rgb.b.toString(16).padStart(2, '0')})`)}
                    className="ml-2 text-gray-400 hover:text-pink-500"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-2">RGBA (百分比)</label>
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded font-mono text-sm flex items-center justify-between">
                  <code>rgba({Math.round((rgb.r / 255) * 100)}%, {Math.round((rgb.g / 255) * 100)}%, {Math.round((rgb.b / 255) * 100)}%, 1)</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 支持HEX、RGB、HSL、RGBA互转 • 实时预览颜色 • 滑块调整
          </div>
        </div>
      </div>
    </div>
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
