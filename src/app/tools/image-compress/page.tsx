'use client'

import { useState, useRef, useEffect } from 'react'
import { Image as ImageIcon, Upload, Download, X } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { useTransferStore } from '@/stores/transferStore'
import { ToolShell } from '@/components/ToolShell'

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
    <ToolShell
      title="IMAGE COMPRESS"
      description="在线压缩图片，减小文件大小"
      path="/tools/image-compress"
      icon={ImageIcon}
      accent="purple"
      actions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="tool-btn"
          >
            <Upload className="h-3.5 w-3.5" />
            {originalImage ? '换图' : '选择图片'}
          </button>
          {originalImage && (
            <>
              <button
                onClick={reCompress}
                disabled={compressing}
                className="tool-btn tool-btn-accent"
              >
                {compressing ? '压缩中...' : '重新压缩'}
              </button>
              <button
                onClick={downloadCompressed}
                disabled={!compressedImage}
                className="tool-btn"
              >
                <Download className="h-3.5 w-3.5" />
                下载
              </button>
              <button onClick={clearAll} className="tool-btn tool-btn-danger">
                <X className="h-3.5 w-3.5" />
                清空
              </button>
            </>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {!originalImage ? (
          /* Upload Area */
          <div className="panel flex min-h-[400px] flex-1 flex-col items-center justify-center gap-4 p-12">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-neon-purple bg-void-200 shadow-neon-purple">
              <Upload className="h-7 w-7 text-neon-purple" />
            </div>
            <p className="font-display text-xl font-semibold text-ink-primary">UPLOAD IMAGE</p>
            <p className="font-mono text-xs text-ink-muted">
              JPG · PNG · WebP — compressed locally in your browser
            </p>
          </div>
        ) : (
          /* Settings + Preview */
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Left Column - Settings */}
            <div className="flex min-h-0 flex-col gap-3">
              <div className="tool-panel">
                <div className="tool-panel-head">
                  <span className="text-neon-purple">&gt;_</span>
                  <span>SETTINGS</span>
                  <span className="ml-auto normal-case tracking-normal">
                    {(quality * 100).toFixed(0)}% · ≤{maxWidth}px
                  </span>
                </div>
                <div className="space-y-5 p-4">
                  {/* Quality */}
                  <div>
                    <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                      压缩质量: {(quality * 100).toFixed(0)}%
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-neon-purple"
                    />
                  </div>

                  {/* Max Width */}
                  <div>
                    <label className="mb-2 block font-mono text-[11px] text-ink-muted">
                      最大宽度: {maxWidth}px
                    </label>
                    <input
                      type="range"
                      min="480"
                      max="3840"
                      step="240"
                      value={maxWidth}
                      onChange={(e) => setMaxWidth(Number(e.target.value))}
                      className="w-full accent-neon-purple"
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              {compressedSize > 0 && (
                <div className="tool-panel">
                  <div className="tool-panel-head">
                    <span className="text-neon-purple">&gt;_</span>
                    <span>STATS</span>
                    <span className="ml-auto normal-case tracking-normal text-neon-lime">
                      -{getCompressionRatio()}%
                    </span>
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between rounded-md bg-void-200 px-3 py-2">
                      <span className="font-mono text-xs text-ink-secondary">原始大小</span>
                      <span className="font-mono text-sm font-semibold text-ink-primary">
                        {formatSize(originalSize)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-md bg-void-200 px-3 py-2">
                      <span className="font-mono text-xs text-ink-secondary">压缩后</span>
                      <span className="font-mono text-sm font-semibold text-ink-primary">
                        {formatSize(compressedSize)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-neon-lime/30 bg-neon-lime/10 px-3 py-2">
                      <span className="font-mono text-xs text-neon-lime">节省空间</span>
                      <span className="font-mono text-sm font-semibold text-neon-lime">
                        {getCompressionRatio()}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="flex min-h-0 flex-col gap-3 lg:col-span-2">
              {/* Original Image */}
              <div className="tool-panel">
                <div className="tool-panel-head">
                  <span className="text-neon-purple">&gt;_</span>
                  <span>ORIGINAL</span>
                  <span className="ml-auto normal-case tracking-normal">
                    {file?.name} · {formatSize(originalSize)}
                  </span>
                </div>
                <div className="flex min-h-[300px] items-center justify-center bg-void-100 p-4">
                  <img
                    src={originalImage!}
                    alt="Original"
                    className="max-h-[400px] max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Compressed Image */}
              {compressedImage && (
                <div className="tool-panel">
                  <div className="tool-panel-head">
                    <span className="text-neon-purple">&gt;_</span>
                    <span>COMPRESSED</span>
                    <span className="ml-auto normal-case tracking-normal">
                      {formatSize(compressedSize)}
                    </span>
                  </div>
                  <div className="flex min-h-[300px] items-center justify-center bg-void-100 p-4">
                    <img
                      src={compressedImage}
                      alt="Compressed"
                      className="max-h-[400px] max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {!compressedImage && !compressing && (
                <div className="panel flex min-h-[300px] flex-col items-center justify-center gap-4 p-12 text-center">
                  <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-neon-purple border-t-transparent"></div>
                  <p className="font-mono text-xs text-ink-secondary">准备压缩...</p>
                </div>
              )}

              {compressing && (
                <div className="panel flex min-h-[300px] flex-col items-center justify-center gap-4 p-12 text-center">
                  <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-neon-purple border-t-transparent"></div>
                  <p className="font-mono text-xs text-ink-secondary">压缩中，请稍候...</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </ToolShell>
  )
}
