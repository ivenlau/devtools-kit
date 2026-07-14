'use client'

import { useState, useRef, useEffect } from 'react'
import { Image as ImageIcon, Upload, Download, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { useTransferStore } from '@/stores/transferStore'

export default function ImageCompressPage() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [compressedImage, setCompressedImage] = useState<string | null>(null)
  const [originalSize, setOriginalSize] = useState(0)
  const [compressedSize, setCompressedSize] = useState(0)
  const [compressing, setCompressing] = useState(false)
  const [quality, setQuality] = useState(0.8)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 从 transferStore 接收文件数据（直接读取避免时序问题）
  useEffect(() => {
    const { pendingData, clearPendingData } = useTransferStore.getState()
    if (pendingData?.content && pendingData.mimeType?.startsWith('image/')) {
      const dataUrl = pendingData.content
      const byteString = atob(dataUrl.split(',')[1])
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const fileName = pendingData.fileName || 'image.png'
      const mimeType = pendingData.mimeType || 'image/png'
      const reconstructedFile = new File([ab], fileName, { type: mimeType })

      setFile(reconstructedFile)
      setOriginalSize(reconstructedFile.size)
      setOriginalImage(dataUrl)
      compressImage(reconstructedFile)
      clearPendingData()
    }
  }, [])

  // Handle file select
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (!selectedFile.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    setFile(selectedFile)
    setOriginalSize(selectedFile.size)

    // Show original image
    const reader = new FileReader()
    reader.onload = (e) => {
      setOriginalImage(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Compress image
    await compressImage(selectedFile)
  }

  // Compress image
  const compressImage = async (imageFile: File) => {
    setCompressing(true)
    setCompressedImage(null)

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: maxWidth,
        useWebWorker: true,
        initialQuality: quality,
      }

      const compressedFile = await imageCompression(imageFile, options)
      setCompressedSize(compressedFile.size)

      const reader = new FileReader()
      reader.onload = (e) => {
        setCompressedImage(e.target?.result as string)
      }
      reader.readAsDataURL(compressedFile)
    } catch (error) {
      console.error('压缩失败:', error)
      alert('图片压缩失败')
    } finally {
      setCompressing(false)
    }
  }

  // Re-compress with new settings
  const reCompress = async () => {
    if (!file) return
    await compressImage(file)
  }

  // Download compressed image
  const downloadCompressed = () => {
    if (!compressedImage || !file) return

    const link = document.createElement('a')
    link.href = compressedImage
    link.download = `compressed_${file.name}`
    link.click()
  }

  // Clear all
  const clearAll = () => {
    setOriginalImage(null)
    setCompressedImage(null)
    setOriginalSize(0)
    setCompressedSize(0)
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Calculate compression ratio
  const getCompressionRatio = () => {
    if (!originalSize || !compressedSize) return 0
    return ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display">图片压缩</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                在线压缩图片，减小文件大小
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Upload Area */}
          {!originalImage && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-10 w-10 text-pink-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">上传图片</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  支持 JPG、PNG、WebP 等格式
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  选择图片
                </button>
              </div>
            </div>
          )}

          {/* Compression Settings and Preview */}
          {originalImage && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Settings */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="text-sm font-semibold mb-4">压缩设置</h3>

                  <div className="space-y-6">
                    {/* Quality */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        压缩质量: {(quality * 100).toFixed(0)}%
                      </label>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.1"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-pink-500"
                      />
                    </div>

                    {/* Max Width */}
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                        最大宽度: {maxWidth}px
                      </label>
                      <input
                        type="range"
                        min="480"
                        max="3840"
                        step="240"
                        value={maxWidth}
                        onChange={(e) => setMaxWidth(Number(e.target.value))}
                        className="w-full accent-pink-500"
                      />
                    </div>

                    {/* Re-compress Button */}
                    <button
                      onClick={reCompress}
                      disabled={compressing}
                      className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {compressing ? '压缩中...' : '重新压缩'}
                    </button>

                    {/* Clear Button */}
                    <button
                      onClick={clearAll}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      清空
                    </button>
                  </div>
                </div>

                {/* Stats */}
                {compressedSize > 0 && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <h3 className="text-sm font-semibold mb-4">压缩统计</h3>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">原始大小</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatSize(originalSize)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <span className="text-sm text-gray-600 dark:text-gray-400">压缩后</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatSize(compressedSize)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-sm text-green-700 dark:text-green-400">节省空间</span>
                        <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                          {getCompressionRatio()}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Preview */}
              <div className="lg:col-span-2 space-y-4">
                {/* Original Image */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="text-sm font-semibold mb-4">原始图片</h3>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                    <img
                      src={originalImage}
                      alt="Original"
                      className="max-w-full max-h-[400px] object-contain"
                    />
                  </div>
                </div>

                {/* Compressed Image */}
                {compressedImage && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">压缩后图片</h3>
                      <button
                        onClick={downloadCompressed}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        下载
                      </button>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 flex items-center justify-center min-h-[300px]">
                      <img
                        src={compressedImage}
                        alt="Compressed"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                    </div>
                  </div>
                )}

                {!compressedImage && !compressing && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                    <div className="inline-block w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">准备压缩...</p>
                  </div>
                )}

                {compressing && (
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
                    <div className="inline-block w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">压缩中，请稍候...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usage Tips */}
          <div className="mt-8 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-pink-800 dark:text-pink-300 mb-2">使用提示</h4>
            <ul className="text-xs text-pink-700 dark:text-pink-400 space-y-1">
              <li>• 所有压缩在浏览器本地完成，图片不会上传到服务器</li>
              <li>• 调整压缩质量可以在文件大小和图片质量之间取得平衡</li>
              <li>• 设置最大宽度可以缩小图片尺寸，更适合网页使用</li>
              <li>• 支持 JPG、PNG、WebP 等常见图片格式</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            💡 本地压缩 • 隐私安全 • 自动调整尺寸
          </div>
        </div>
      </div>
    </div>
  )
}
