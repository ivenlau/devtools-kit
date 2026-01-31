'use client'

import { useState, useEffect } from 'react'
import { QrCode, Copy, Download, Image as ImageIcon } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeGeneratorPage() {
  const [text, setText] = useState('https://github.com')
  const [size, setSize] = useState(256)
  const [color, setColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#FFFFFF')
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M')

  // 下载QR码
  const downloadQRCode = () => {
    // @ts-ignore
    const svg = document.getElementById('qrcode-svg') as SVGElement
    if (!svg) return

    // 将 SVG 转换为 Canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    // @ts-ignore
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      canvas.width = size
      canvas.height = size
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
    // @ts-ignore
    const svg = document.getElementById('qrcode-svg') as SVGElement
    if (!svg) return

    // @ts-ignore
    const svgData = new XMLSerializer().serializeToString(svg)
    const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`
    navigator.clipboard.writeText(base64)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">二维码生成器</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                生成自定义二维码，支持多种格式
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Settings */}
          <div className="space-y-6">
            {/* Content */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">二维码内容</h3>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="输入文本或URL..."
                className="w-full h-32 p-4 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Options */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">生成选项</h3>

              <div className="space-y-4">
                {/* Size */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    尺寸: {size}px × {size}px
                  </label>
                  <input
                    type="range"
                    min={128}
                    max={512}
                    step={32}
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      前景色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      背景色
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded font-mono bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Error Correction */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    容错率
                  </label>
                  <div className="flex gap-2">
                    {(['L', 'M', 'Q', 'H'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setErrorCorrection(level)}
                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                          errorCorrection === level
                            ? 'bg-violet-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {level} ({level === 'L' ? '7%' : level === 'M' ? '15%' : level === 'Q' ? '25%' : '30%'})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Sizes */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    快速尺寸
                </label>
                  <div className="flex flex-wrap gap-2">
                    {[128, 256, 384, 512].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`px-3 py-2 text-sm rounded-lg transition-all ${
                          size === s
                            ? 'bg-violet-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800'
                        }`}
                      >
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">操作</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  下载 PNG
                </button>
                <button
                  onClick={copyBase64}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  复制 Base64
                </button>
              </div>
            </div>

            {/* Usage Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">使用提示</h4>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                <li>• 内容越多，二维码越密集，建议保持简短</li>
                <li>• 使用高容错率可以提高识别成功率</li>
                <li>• 前景色和背景色需要有足够对比度</li>
                <li>• 生成的二维码可离线扫描</li>
              </ul>
            </div>
          </div>

          {/* Preview */}
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 sticky top-6">
              <h3 className="text-sm font-semibold mb-4 text-center">预览</h3>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white rounded-lg shadow-lg">
                  <QRCodeSVG
                    id="qrcode-svg"
                    value={text}
                    size={size}
                    fgColor={color}
                    bgColor={bgColor}
                    level={errorCorrection}
                  />
                </div>
              </div>

              {/* Color Info */}
              <div className="text-center text-sm space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-6 rounded" style={{ backgroundColor: color }}></span>
                  <span className="text-gray-600 dark:text-gray-400">前景色</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600" style={{ backgroundColor: bgColor }}></span>
                  <span className="text-gray-600 dark:text-gray-400">背景色</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{size} × {size}px</span>
                </div>
              </div>

              {/* Content Preview */}
              {text && text.length <= 50 && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                    {text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm textgray-600 dark:text-gray-400">
            💡 支持自定义颜色和尺寸 • 可调节容错率 • 下载PNG格式
          </div>
        </div>
      </div>
    </div>
  )
}
