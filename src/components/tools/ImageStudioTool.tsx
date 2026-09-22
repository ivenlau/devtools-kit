'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import JSZip from 'jszip'
import {
  WandSparkles, Plus, Trash2, Download, Copy, Undo2, Redo2, Eye, Package,
  RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2, Lock, Unlock, ImagePlus, X,
} from 'lucide-react'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'
import { useTransferFile } from '@/lib/useTransferData'
import { dataUrlToFile } from '@/lib/image/file'
import {
  DEFAULT_SETTINGS, SIZE_PRESETS, renderImage, canvasToBlob, canvasToBlobUnderTarget,
  applyFilenamePattern, formatExtension, flattenOnBackground, supportsFormat,
  type ImageSettings, type Redaction,
} from '@/lib/image/studio'

interface ImageItem {
  id: string
  name: string
  file: File
  img: HTMLImageElement
  thumbUrl: string
  originalBytes: number
  settings: ImageSettings
  history: ImageSettings[]
  future: ImageSettings[]
}

const uid = () => Math.random().toString(36).slice(2, 10)
const clone = (s: ImageSettings): ImageSettings =>
  JSON.parse(JSON.stringify({ ...s, redactions: s.redactions.map((r) => ({ ...r })) }))

export default function ImageStudioPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<ImageItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [tab, setTab] = useState<'size' | 'adjust' | 'privacy' | 'watermark' | 'export'>('size')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [estimateKB, setEstimateKB] = useState<number | null>(null)
  const [compare, setCompare] = useState(false)
  const [busy, setBusy] = useState(false)
  const [avifOk, setAvifOk] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastEditRef = useRef(0)
  const { pendingData, clearPendingData } = useTransferFile()

  const active = items.find((i) => i.id === activeId) ?? null

  // AVIF encode support is browser-dependent
  useEffect(() => {
    setAvifOk(supportsFormat('avif'))
  }, [])

  const flash = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 1800)
  }, [])

  // ---------- add images ----------

  const addFiles = useCallback(async (files: File[]) => {
    const imgs = files.filter((f) => f.type.startsWith('image/'))
    const loaded: ImageItem[] = []
    for (const file of imgs) {
      const url = URL.createObjectURL(file)
      const img = new Image()
      await new Promise<void>((resolve) => {
        img.onload = () => resolve()
        img.onerror = () => resolve()
        img.src = url
      })
      if (!img.naturalWidth) continue
      loaded.push({
        id: uid(),
        name: file.name,
        file,
        img,
        thumbUrl: url,
        originalBytes: file.size,
        settings: clone(DEFAULT_SETTINGS),
        history: [],
        future: [],
      })
    }
    if (!loaded.length) return
    setItems((prev) => {
      const next = [...prev, ...loaded]
      setActiveId((cur) => cur ?? next[0].id)
      return next
    })
  }, [])

  // Consume pasted-in data from the home screen once
  useEffect(() => {
    if (pendingData?.content && pendingData.mimeType?.startsWith('image/')) {
      const file = dataUrlToFile(pendingData.content, pendingData.fileName || 'pasted.png', pendingData.mimeType)
      if (file) addFiles([file])
      clearPendingData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Global paste support
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = [...(e.clipboardData?.files ?? [])]
      if (files.length) addFiles(files)
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [addFiles])

  // ---------- settings editing with history ----------

  const updateSettings = useCallback(
    (updater: (s: ImageSettings) => ImageSettings) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== activeId) return item
          const now = Date.now()
          const coalesce = now - lastEditRef.current < 500
          lastEditRef.current = now
          const next = updater(item.settings)
          return coalesce
            ? { ...item, settings: next }
            : { ...item, settings: next, history: [...item.history.slice(-49), item.settings], future: [] }
        }),
      )
    },
    [activeId],
  )

  const undo = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeId || !item.history.length) return item
        const history = [...item.history]
        const prevSettings = history.pop()!
        return {
          ...item,
          settings: prevSettings,
          history,
          future: [item.settings, ...item.future].slice(0, 50),
        }
      }),
    )
    lastEditRef.current = 0
  }

  const redo = () => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== activeId || !item.future.length) return item
        const future = [...item.future]
        const nextSettings = future.shift()!
        return {
          ...item,
          settings: nextSettings,
          history: [...item.history, item.settings],
          future,
        }
      }),
    )
    lastEditRef.current = 0
  }

  // ---------- live preview render ----------

  useEffect(() => {
    if (!active) {
      setPreviewUrl(null)
      setEstimateKB(null)
      return
    }
    const timer = setTimeout(async () => {
      try {
        const canvas = renderImage(active.img, active.settings, 1600)
        // estimate export size with the real format settings on the preview
        const estBlob =
          active.settings.targetKB && active.settings.format !== 'png'
            ? await canvasToBlobUnderTarget(canvas, active.settings.format, active.settings.targetKB)
            : await canvasToBlob(canvas, active.settings.format, active.settings.quality)
        setEstimateKB(estBlob.size / 1024)
        const url = URL.createObjectURL(estBlob)
        setPreviewUrl((old) => {
          if (old) URL.revokeObjectURL(old)
          return url
        })
      } catch {
        /* keep previous preview */
      }
    }, 220)
    return () => clearTimeout(timer)
  }, [active])

  // ---------- crop aspect helper ----------

  const baseAspect = (item: ImageItem): number => {
    const s = item.settings
    const srcW = item.img.naturalWidth
    const srcH = item.img.naturalHeight
    const cw = (s.crop.w / 100) * srcW
    const ch = (s.crop.h / 100) * srcH
    const rotated = s.rotation === 90 || s.rotation === 270
    return rotated ? cw / ch : ch / cw
  }

  const setWidth = (w: number) => {
    if (!active) return
    if (active.settings.lockAspect) {
      const h = Math.max(1, Math.round(w / baseAspect(active)))
      updateSettings((s) => ({ ...s, width: w, height: h }))
    } else {
      updateSettings((s) => ({ ...s, width: w }))
    }
  }

  const setHeight = (h: number) => {
    if (!active) return
    if (active.settings.lockAspect) {
      const w = Math.max(1, Math.round(h * baseAspect(active)))
      updateSettings((s) => ({ ...s, width: w, height: h }))
    } else {
      updateSettings((s) => ({ ...s, height: h }))
    }
  }

  // ---------- export ----------

  const renderFull = async (item: ImageItem): Promise<HTMLCanvasElement> => {
    const canvas = renderImage(item.img, item.settings)
    const s = item.settings
    if (s.format === 'jpeg' || s.flattenTransparent) {
      return flattenOnBackground(canvas)
    }
    return canvas
  }

  const exportItem = async (item: ImageItem, index: number): Promise<{ name: string; blob: Blob } | null> => {
    try {
      const canvas = await renderFull(item)
      const s = item.settings
      const blob =
        s.targetKB && s.format !== 'png'
          ? await canvasToBlobUnderTarget(canvas, s.format, s.targetKB)
          : await canvasToBlob(canvas, s.format, s.quality)
      const name = applyFilenamePattern(s.filenamePattern || '{name}-optimized', {
        name: item.name,
        width: canvas.width,
        height: canvas.height,
        format: s.format,
        index,
      })
      return { name, blob }
    } catch {
      return null
    }
  }

  const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportActive = async () => {
    if (!active) return
    setBusy(true)
    const result = await exportItem(active, items.indexOf(active))
    setBusy(false)
    if (result) downloadBlob(result.blob, result.name)
    else flash(t('导出失败'))
  }

  const copyPNG = async () => {
    if (!active) return
    setBusy(true)
    try {
      const canvas = renderImage(active.img, active.settings)
      const blob = await canvasToBlob(canvas, 'png', 100)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      flash(t('已复制到剪贴板'))
    } catch {
      flash(t('复制失败，请改用下载'))
    }
    setBusy(false)
  }

  const exportZip = async () => {
    if (!items.length) return
    setBusy(true)
    try {
      const zip = new JSZip()
      const used = new Set<string>()
      for (let i = 0; i < items.length; i++) {
        const result = await exportItem(items[i], i)
        if (!result) continue
        let name = result.name
        let n = 2
        while (used.has(name)) {
          name = result.name.replace(/(\.[a-z0-9]+)$/i, `-${n}$1`)
          n++
        }
        used.add(name)
        zip.file(name, result.blob)
      }
      const blob = await zip.generateAsync({ type: 'blob' })
      downloadBlob(blob, `image-studio-${items.length}.zip`)
    } catch {
      flash(t('导出失败'))
    }
    setBusy(false)
  }

  const applyToAll = () => {
    if (!active) return
    const shared = clone(active.settings)
    setItems((prev) => prev.map((item) => ({ ...item, settings: clone(shared), history: [...item.history, item.settings], future: [] })))
    flash(t('已应用到全部图片'))
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id)
      if (id === activeId) setActiveId(next[0]?.id ?? null)
      return next
    })
  }

  const clearAll = () => {
    setItems([])
    setActiveId(null)
  }

  // ---------- render helpers ----------

  const labelCls = 'mb-2 block font-mono text-[11px] text-ink-muted'
  const inputCls =
    'w-full min-w-0 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none'

  const Slider = ({ label, value, min, max, step = 1, onChange, suffix }: {
    label: string
    value: number
    min: number
    max: number
    step?: number
    onChange: (v: number) => void
    suffix?: string
  }) => (
    <div>
      <label className={labelCls}>
        {label}: {value}
        {suffix}
      </label>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-neon-cyan" />
    </div>
  )

  const ChipToggle = ({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`chip ${on ? 'chip-active' : ''}`}>
      {on ? '■ ' : '□ '}
      {label}
    </button>
  )

  const origDims = active ? `${active.img.naturalWidth}×${active.img.naturalHeight}` : ''
  const outDims = active
    ? `${active.settings.width || active.img.naturalWidth}×${active.settings.height || active.img.naturalHeight}`
    : ''
  const estimateDelta =
    active && estimateKB ? Math.round(((estimateKB * 1024 - active.originalBytes) / active.originalBytes) * 100) : null

  return (
    <ToolShell
      title="IMAGE"
      description={t('图像：调整尺寸、压缩、裁剪、滤镜、水印与格式转换')}
      path="/tools/image-studio"
      icon={WandSparkles}
      actions={
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              addFiles([...(e.target.files ?? [])])
              e.target.value = ''
            }}
          />
          {items.length > 0 && (
            <>
              <button onClick={copyPNG} disabled={busy} className="tool-btn tool-btn-icon" title={t('复制 PNG')} aria-label={t('复制 PNG')}>
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button onClick={exportActive} disabled={busy} className="tool-btn tool-btn-icon tool-btn-accent" title={t('导出图片')} aria-label={t('导出图片')}>
                <Download className="h-3.5 w-3.5" />
              </button>
              {items.length > 1 && (
                <button
                  onClick={exportZip}
                  disabled={busy}
                  className="tool-btn tool-btn-icon"
                  title={t('将 {n} 张图片导出为 ZIP').replace('{n}', String(items.length))}
                  aria-label={t('将 {n} 张图片导出为 ZIP').replace('{n}', String(items.length))}
                >
                  <Package className="h-3.5 w-3.5" />
                </button>
              )}
              <button onClick={clearAll} className="tool-btn tool-btn-icon tool-btn-danger" title={t('全部清除')} aria-label={t('全部清除')}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        {items.length === 0 ? (
          /* ---------- upload zone ---------- */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              addFiles([...e.dataTransfer.files])
            }}
            className="panel flex min-h-[400px] flex-1 cursor-pointer flex-col items-center justify-center gap-4 p-12 text-center transition-colors hover:border-neon-purple"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-neon-purple bg-void-200 shadow-neon-purple">
              <ImagePlus className="h-7 w-7 text-neon-purple" />
            </div>
            <p className="font-display text-xl font-semibold text-ink-primary">{t('把图片拖到这里')}</p>
            <p className="font-mono text-xs text-ink-muted">{t('选择文件、拖入文件夹或粘贴图片即可开始')}</p>
            <p className="font-mono text-[10px] text-ink-muted">JPG · PNG · WebP · GIF · SVG · BMP · AVIF — {t('本地处理 · 不上传')}</p>
          </div>
        ) : (
          <>
            {/* ---------- image strip ---------- */}
            <div className="tool-panel shrink-0">
              <div className="tool-panel-head">
                <span className="text-neon-purple">&gt;_</span>
                <span>IMAGES</span>
                <span className="ml-auto normal-case tracking-normal">
                  {items.length} {t('张')} · {t('批量编辑')}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto p-3">
                {items.map((item) => (
                  <div key={item.id} className="group relative shrink-0">
                    <button
                      onClick={() => setActiveId(item.id)}
                      className={`block h-16 w-16 overflow-hidden rounded-md border-2 transition-all ${
                        item.id === activeId ? 'border-neon-purple shadow-[0_0_12px_rgba(168,85,247,0.35)]' : 'border-border-dim hover:border-border-glow'
                      }`}
                      title={`${item.name} · ${item.img.naturalWidth}×${item.img.naturalHeight}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.thumbUrl} alt={item.name} className="h-full w-full object-cover" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-1.5 -top-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-neon-red bg-void-100 text-neon-red group-hover:flex"
                      aria-label={t('移除图片')}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border-glow text-ink-muted transition-colors hover:border-neon-purple hover:text-neon-purple"
                  aria-label={t('继续添加')}
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_400px]">
              {/* ---------- preview ---------- */}
              <div className="tool-panel">
                <div className="tool-panel-head">
                  <span className="text-neon-purple">&gt;_</span>
                  <span>PREVIEW</span>
                  <div className="ml-auto flex shrink-0 items-center gap-1.5">
                    {active && (
                      <span className="hidden truncate font-mono text-[11px] text-ink-muted 2xl:inline">
                        {active.name} · {origDims} → {outDims}
                        {estimateKB != null && (
                          <>
                            {' · '}
                            {estimateKB < 1024 ? `${estimateKB.toFixed(1)} KB` : `${(estimateKB / 1024).toFixed(2)} MB`}
                            {estimateDelta != null && (
                              <span className={estimateDelta <= 0 ? ' text-neon-lime' : ' text-neon-amber'}>
                                {' '}
                                ({estimateDelta > 0 ? '+' : ''}
                                {estimateDelta}%)
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    )}
                    <button
                      onClick={undo}
                      disabled={!active?.history.length}
                      className="tool-btn tool-btn-icon !py-1"
                      title={t('撤销')}
                      aria-label={t('撤销')}
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={redo}
                      disabled={!active?.future.length}
                      className="tool-btn tool-btn-icon !py-1"
                      title={t('重做')}
                      aria-label={t('重做')}
                    >
                      <Redo2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onPointerDown={(e) => {
                        e.preventDefault()
                        setCompare(true)
                      }}
                      onPointerUp={() => setCompare(false)}
                      onPointerLeave={() => setCompare(false)}
                      onPointerCancel={() => setCompare(false)}
                      disabled={!active}
                      className={`tool-btn tool-btn-icon !py-1 select-none ${compare ? 'tool-btn-accent' : ''}`}
                      title={t('按住对比原图')}
                      aria-label={t('按住对比原图')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex min-h-[320px] items-center justify-center bg-void-100 p-4">
                  {active && (
                    <>
                      {/* original (compare) */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={active.thumbUrl}
                        alt="original"
                        className={`max-h-[480px] max-w-full object-contain ${compare ? '' : 'hidden'}`}
                      />
                      {previewUrl && !compare && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={previewUrl} alt="preview" className="max-h-[480px] max-w-full object-contain" />
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ---------- settings ---------- */}
              {active && (
                <div className="tool-panel">
                  <div className="tool-panel-head">
                    <span className="text-neon-purple">&gt;_</span>
                    <span>EDIT</span>
                    <span className="ml-auto normal-case tracking-normal">{t('50 步历史')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 border-b border-border-dim px-3 py-2.5">
                    {(
                      [
                        ['size', '尺寸'],
                        ['adjust', '调整'],
                        ['privacy', '隐私'],
                        ['watermark', '水印'],
                        ['export', '导出'],
                      ] as const
                    ).map(([id, label]) => (
                      <button key={id} onClick={() => setTab(id)} className={`chip ${tab === id ? 'chip-active' : ''}`}>
                        {t(label)}
                      </button>
                    ))}
                  </div>

                  <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4" style={{ maxHeight: 'calc(100dvh - var(--header-total) - 20.5rem)' }}>
                    {/* ================= SIZE ================= */}
                    {tab === 'size' && (
                      <>
                        <div>
                          <label className={labelCls}>{t('尺寸预设')}</label>
                          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                            {SIZE_PRESETS.map((p) => (
                              <button
                                key={p.label}
                                onClick={() =>
                                  updateSettings((s) => ({
                                    ...s,
                                    width: p.width,
                                    height: p.height,
                                    lockAspect: false,
                                  }))
                                }
                                className="rounded-md border border-border-dim bg-void-200 px-2 py-1.5 text-left transition-all hover:border-border-glow"
                              >
                                <span className="block font-mono text-[11px] text-ink-primary">{t(p.label)}</span>
                                <span className="block font-mono text-[10px] text-ink-muted">
                                  {p.width}×{p.height}
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <label className="font-mono text-[11px] text-ink-muted">{t('输出尺寸')}</label>
                            <button
                              onClick={() => updateSettings((s) => ({ ...s, lockAspect: !s.lockAspect }))}
                              className="tool-btn tool-btn-icon"
                              title={active.settings.lockAspect ? t('锁定宽高比') : t('解锁宽高比')}
                            >
                              {active.settings.lockAspect ? <Lock className="h-3.5 w-3.5 text-neon-cyan" /> : <Unlock className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>{t('宽度')}</label>
                              <input
                                type="number"
                                min={16}
                                value={active.settings.width || active.img.naturalWidth}
                                onChange={(e) => setWidth(Math.max(16, Number(e.target.value) || 0))}
                                className={inputCls}
                              />
                            </div>
                            <div>
                              <label className={labelCls}>{t('高度')}</label>
                              <input
                                type="number"
                                min={16}
                                value={active.settings.height || active.img.naturalHeight}
                                onChange={(e) => setHeight(Math.max(16, Number(e.target.value) || 0))}
                                className={inputCls}
                              />
                            </div>
                          </div>
                          <div className="mt-2">
                            <ChipToggle
                              label={t('允许放大')}
                              on={active.settings.allowUpscale}
                              onToggle={() => updateSettings((s) => ({ ...s, allowUpscale: !s.allowUpscale }))}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="block font-mono text-[11px] text-ink-muted">{t('裁剪')}</label>
                          <Slider label={t('左侧')} value={active.settings.crop.x} min={0} max={99} onChange={(v) => updateSettings((s) => ({ ...s, crop: { ...s.crop, x: v } }))} suffix="%" />
                          <Slider label={t('顶部')} value={active.settings.crop.y} min={0} max={99} onChange={(v) => updateSettings((s) => ({ ...s, crop: { ...s.crop, y: v } }))} suffix="%" />
                          <Slider label={t('裁剪宽度')} value={active.settings.crop.w} min={5} max={100} onChange={(v) => updateSettings((s) => ({ ...s, crop: { ...s.crop, w: v } }))} suffix="%" />
                          <Slider label={t('裁剪高度')} value={active.settings.crop.h} min={5} max={100} onChange={(v) => updateSettings((s) => ({ ...s, crop: { ...s.crop, h: v } }))} suffix="%" />
                          <button
                            onClick={() => updateSettings((s) => ({ ...s, crop: { x: 0, y: 0, w: 100, h: 100 } }))}
                            className="tool-btn"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            {t('重置裁剪')}
                          </button>
                        </div>

                        <div>
                          <label className={labelCls}>{t('旋转与翻转')}</label>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => updateSettings((s) => ({ ...s, rotation: (s.rotation + 270) % 360 }))} className="tool-btn" title={t('向左旋转')}>
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => updateSettings((s) => ({ ...s, rotation: (s.rotation + 90) % 360 }))} className="tool-btn" title={t('向右旋转')}>
                              <RotateCw className="h-3.5 w-3.5" />
                            </button>
                            <span className="chip">{active.settings.rotation}°</span>
                            <button
                              onClick={() => updateSettings((s) => ({ ...s, rotation: 0, flipH: false, flipV: false }))}
                              className="tool-btn"
                            >
                              {t('重置旋转')}
                            </button>
                          </div>
                          <div className="mt-2 flex gap-2">
                            <ChipToggle label={t('水平翻转')} on={active.settings.flipH} onToggle={() => updateSettings((s) => ({ ...s, flipH: !s.flipH }))} />
                            <ChipToggle label={t('垂直翻转')} on={active.settings.flipV} onToggle={() => updateSettings((s) => ({ ...s, flipV: !s.flipV }))} />
                          </div>
                        </div>

                        <Slider
                          label={t('圆角半径')}
                          value={active.settings.cornerRadius}
                          min={0}
                          max={50}
                          onChange={(v) => updateSettings((s) => ({ ...s, cornerRadius: v }))}
                          suffix="%"
                        />
                      </>
                    )}

                    {/* ================= ADJUST ================= */}
                    {tab === 'adjust' && (
                      <>
                        <Slider label={t('亮度')} value={active.settings.brightness} min={0} max={200} onChange={(v) => updateSettings((s) => ({ ...s, brightness: v }))} suffix="%" />
                        <Slider label={t('对比度')} value={active.settings.contrast} min={0} max={200} onChange={(v) => updateSettings((s) => ({ ...s, contrast: v }))} suffix="%" />
                        <Slider label={t('饱和度')} value={active.settings.saturation} min={0} max={200} onChange={(v) => updateSettings((s) => ({ ...s, saturation: v }))} suffix="%" />
                        <Slider label={t('色温')} value={active.settings.temperature} min={-100} max={100} onChange={(v) => updateSettings((s) => ({ ...s, temperature: v }))} />
                        <Slider label={t('色相')} value={active.settings.hue} min={-180} max={180} onChange={(v) => updateSettings((s) => ({ ...s, hue: v }))} suffix="°" />
                        <Slider label={t('模糊')} value={active.settings.blur} min={0} max={20} step={0.5} onChange={(v) => updateSettings((s) => ({ ...s, blur: v }))} suffix="px" />
                        <Slider label={t('灰度')} value={active.settings.grayscale} min={0} max={100} onChange={(v) => updateSettings((s) => ({ ...s, grayscale: v }))} suffix="%" />
                        <Slider label={t('复古色')} value={active.settings.sepia} min={0} max={100} onChange={(v) => updateSettings((s) => ({ ...s, sepia: v }))} suffix="%" />
                        <button
                          onClick={() =>
                            updateSettings((s) => ({
                              ...s,
                              brightness: 100,
                              contrast: 100,
                              saturation: 100,
                              temperature: 0,
                              hue: 0,
                              blur: 0,
                              grayscale: 0,
                              sepia: 0,
                            }))
                          }
                          className="tool-btn"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          {t('重置调整')}
                        </button>
                      </>
                    )}

                    {/* ================= PRIVACY ================= */}
                    {tab === 'privacy' && (
                      <>
                        <p className="rounded-md border border-border-dim bg-void-200 p-3 font-mono text-[11px] leading-relaxed text-ink-secondary">
                          {t('导出的文件会移除位置、相机和其他内嵌元数据。')}
                        </p>
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <label className="font-mono text-[11px] text-ink-muted">{t('内容遮挡')}</label>
                            <button
                              onClick={() =>
                                updateSettings((s) => ({
                                  ...s,
                                  redactions: [
                                    ...s.redactions,
                                    { id: uid(), mode: 'solid', x: 35, y: 40, w: 30, h: 15 },
                                  ],
                                }))
                              }
                              className="tool-btn"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              {t('添加区域')}
                            </button>
                          </div>
                          <p className="mb-3 font-mono text-[10px] text-ink-muted">{t('按百分比坐标覆盖或像素化指定区域。')}</p>
                          <div className="space-y-3">
                            {active.settings.redactions.map((r, idx) => (
                              <div key={r.id} className="rounded-md border border-border-dim bg-void-200 p-3">
                                <div className="mb-2 flex items-center justify-between">
                                  <span className="font-mono text-[11px] text-ink-primary">
                                    {t('区域')} {idx + 1}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <select
                                      value={r.mode}
                                      onChange={(e) =>
                                        updateSettings((s) => ({
                                          ...s,
                                          redactions: s.redactions.map((x) =>
                                            x.id === r.id ? { ...x, mode: e.target.value as Redaction['mode'] } : x,
                                          ),
                                        }))
                                      }
                                      className="tool-select"
                                    >
                                      <option value="solid">{t('纯色覆盖')}</option>
                                      <option value="pixelate">{t('像素化')}</option>
                                    </select>
                                    <button
                                      onClick={() => updateSettings((s) => ({ ...s, redactions: s.redactions.filter((x) => x.id !== r.id) }))}
                                      className="tool-btn tool-btn-icon tool-btn-danger"
                                      aria-label={t('移除区域')}
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                  {(['x', 'y', 'w', 'h'] as const).map((k) => (
                                    <div key={k}>
                                      <label className={labelCls}>
                                        {{ x: 'X', y: 'Y', w: t('宽度'), h: t('高度') }[k]}
                                      </label>
                                      <input
                                        type="number"
                                        min={k === 'x' || k === 'y' ? 0 : 1}
                                        max={100}
                                        value={r[k]}
                                        onChange={(e) =>
                                          updateSettings((s) => ({
                                            ...s,
                                            redactions: s.redactions.map((x) =>
                                              x.id === r.id ? { ...x, [k]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } : x,
                                            ),
                                          }))
                                        }
                                        className={inputCls}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* ================= WATERMARK ================= */}
                    {tab === 'watermark' && (
                      <>
                        <ChipToggle
                          label={t('显示水印')}
                          on={active.settings.watermark.enabled}
                          onToggle={() => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, enabled: !s.watermark.enabled } }))}
                        />
                        <div className={active.settings.watermark.enabled ? 'space-y-4' : 'pointer-events-none space-y-4 opacity-40'}>
                          <div className="flex flex-wrap gap-2">
                            {(
                              [
                                ['轻柔', { opacity: 45, bgOpacity: 0, shadow: true, size: 4 }],
                                ['徽标', { opacity: 90, bgOpacity: 60, shadow: false, size: 6 }],
                                ['平铺', { layout: 'tile' as const, opacity: 30, bgOpacity: 0, rotation: -30, size: 4 }],
                              ] as const
                            ).map(([label, patch]) => (
                              <button
                                key={label}
                                onClick={() => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, ...patch, enabled: true } }))}
                                className="chip"
                              >
                                {t(label)}
                              </button>
                            ))}
                          </div>
                          <div>
                            <label className={labelCls}>{t('文字')}</label>
                            <input
                              type="text"
                              value={active.settings.watermark.text}
                              onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, text: e.target.value } }))}
                              placeholder="© 你的名称"
                              className={inputCls}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>{t('布局')}</label>
                              <select
                                value={active.settings.watermark.layout}
                                onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, layout: e.target.value as 'single' | 'tile' } }))}
                                className="tool-select w-full"
                              >
                                <option value="single">{t('单个')}</option>
                                <option value="tile">{t('平铺')}</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>{t('水印位置')}</label>
                              <select
                                value={active.settings.watermark.position}
                                onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, position: e.target.value as never } }))}
                                className="tool-select w-full"
                              >
                                <option value="top-left">{t('左上')}</option>
                                <option value="top-right">{t('右上')}</option>
                                <option value="center">{t('居中')}</option>
                                <option value="bottom-left">{t('左下')}</option>
                                <option value="bottom-right">{t('右下')}</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>{t('字体')}</label>
                              <select
                                value={active.settings.watermark.fontFamily}
                                onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, fontFamily: e.target.value as never } }))}
                                className="tool-select w-full"
                              >
                                <option value="sans">{t('无衬线')}</option>
                                <option value="serif">{t('衬线')}</option>
                                <option value="mono">{t('等宽')}</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>{t('字重')}</label>
                              <select
                                value={active.settings.watermark.fontWeight}
                                onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, fontWeight: e.target.value as never } }))}
                                className="tool-select w-full"
                              >
                                <option value="normal">{t('常规')}</option>
                                <option value="600">{t('半粗')}</option>
                                <option value="bold">{t('粗体')}</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className={labelCls}>{t('文字颜色')}</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={active.settings.watermark.color}
                                  onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, color: e.target.value.toUpperCase() } }))}
                                  className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border-dim bg-void-200 p-1"
                                />
                                <input
                                  type="text"
                                  value={active.settings.watermark.color}
                                  onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, color: e.target.value } }))}
                                  className={inputCls}
                                  spellCheck={false}
                                />
                              </div>
                            </div>
                            <div>
                              <label className={labelCls}>{t('背景颜色')}</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={active.settings.watermark.bgColor}
                                  onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, bgColor: e.target.value.toUpperCase() } }))}
                                  className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border-dim bg-void-200 p-1"
                                />
                                <input
                                  type="text"
                                  value={active.settings.watermark.bgColor}
                                  onChange={(e) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, bgColor: e.target.value } }))}
                                  className={inputCls}
                                  spellCheck={false}
                                />
                              </div>
                            </div>
                          </div>
                          <Slider label={t('不透明度')} value={active.settings.watermark.opacity} min={0} max={100} onChange={(v) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, opacity: v } }))} suffix="%" />
                          <Slider label={t('文字大小')} value={active.settings.watermark.size} min={2} max={20} onChange={(v) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, size: v } }))} suffix="%" />
                          <Slider label={t('旋转')} value={active.settings.watermark.rotation} min={-180} max={180} onChange={(v) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, rotation: v } }))} suffix="°" />
                          <Slider label={t('背景不透明度')} value={active.settings.watermark.bgOpacity} min={0} max={100} onChange={(v) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, bgOpacity: v } }))} suffix="%" />
                          <Slider label={t('内边距')} value={active.settings.watermark.bgPadding} min={0} max={100} onChange={(v) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, bgPadding: v } }))} suffix="%" />
                          <Slider label={t('边距')} value={active.settings.watermark.margin} min={0} max={20} onChange={(v) => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, margin: v } }))} suffix="%" />
                          <ChipToggle label={t('文字阴影')} on={active.settings.watermark.shadow} onToggle={() => updateSettings((s) => ({ ...s, watermark: { ...s.watermark, shadow: !s.watermark.shadow } }))} />
                        </div>
                      </>
                    )}

                    {/* ================= EXPORT ================= */}
                    {tab === 'export' && (
                      <>
                        <div>
                          <label className={labelCls}>{t('文件格式')}</label>
                          <div className="flex gap-2">
                            {(['jpeg', 'png', 'webp', 'avif'] as const).map((f) => (
                              <button
                                key={f}
                                disabled={f === 'avif' && !avifOk}
                                onClick={() => updateSettings((s) => ({ ...s, format: f }))}
                                className={`chip flex-1 justify-center uppercase ${active.settings.format === f ? 'chip-active' : ''} ${
                                  f === 'avif' && !avifOk ? 'cursor-not-allowed opacity-40' : ''
                                }`}
                                title={f === 'avif' && !avifOk ? t('当前浏览器不支持 AVIF 导出') : undefined}
                              >
                                {f === 'jpeg' ? 'jpg' : f}
                              </button>
                            ))}
                          </div>
                        </div>
                        {active.settings.format !== 'png' && (
                          <Slider label={t('质量')} value={active.settings.quality} min={1} max={100} onChange={(v) => updateSettings((s) => ({ ...s, quality: v }))} suffix="%" />
                        )}
                        {active.settings.format !== 'png' && (
                          <div>
                            <label className={labelCls}>{t('目标文件大小 (KB)')}</label>
                            <input
                              type="number"
                              min={0}
                              value={active.settings.targetKB ?? ''}
                              placeholder={t('留空则使用质量滑块')}
                              onChange={(e) =>
                                updateSettings((s) => ({ ...s, targetKB: Number(e.target.value) > 0 ? Number(e.target.value) : null }))
                              }
                              className={inputCls}
                            />
                            <p className="mt-1.5 font-mono text-[10px] text-ink-muted">
                              {t('适用于 JPG、WebP 和 AVIF；会尽量生成不超过目标的最大文件。')}
                            </p>
                          </div>
                        )}
                        <div>
                          <label className={labelCls}>{t('文件名规则')}</label>
                          <input
                            type="text"
                            value={active.settings.filenamePattern}
                            onChange={(e) => updateSettings((s) => ({ ...s, filenamePattern: e.target.value }))}
                            className={inputCls}
                            spellCheck={false}
                          />
                          <p className="mt-1.5 font-mono text-[10px] text-ink-muted">
                            {'{name} · {width} · {height} · {format} · {index}'}
                          </p>
                        </div>
                        {active.settings.format !== 'jpeg' && (
                          <ChipToggle
                            label={t('替换透明背景')}
                            on={active.settings.flattenTransparent}
                            onToggle={() => updateSettings((s) => ({ ...s, flattenTransparent: !s.flattenTransparent }))}
                          />
                        )}
                        <div className="space-y-2 border-t border-border-dim pt-4">
                          <div className="flex items-center justify-between font-mono text-[11px] text-ink-secondary">
                            <span>{t('输出尺寸')}</span>
                            <strong className="text-ink-primary">{outDims}</strong>
                          </div>
                          {estimateKB != null && (
                            <div className="flex items-center justify-between font-mono text-[11px] text-ink-secondary">
                              <span>{t('预览估算')}</span>
                              <strong className="text-ink-primary">
                                {estimateKB < 1024 ? `${estimateKB.toFixed(1)} KB` : `${(estimateKB / 1024).toFixed(2)} MB`}
                              </strong>
                            </div>
                          )}
                          <button onClick={exportActive} disabled={busy} className="tool-btn tool-btn-accent w-full justify-center py-2.5">
                            <Download className="h-4 w-4" />
                            {busy ? t('处理中…') : t('导出图片')}
                          </button>
                          <div className="flex gap-2">
                            {items.length > 1 && (
                              <button onClick={applyToAll} disabled={busy} className="tool-btn flex-1 justify-center">
                                {t('应用到全部图片')}
                              </button>
                            )}
                            <button onClick={exportZip} disabled={busy} className="tool-btn flex-1 justify-center">
                              <Package className="h-3.5 w-3.5" />
                              {t('将 {n} 张图片导出为 ZIP').replace('{n}', String(items.length))}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* toast */}
        {toast && (
          <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-md border border-neon-lime/40 bg-void-200 px-4 py-2 font-mono text-xs text-neon-lime shadow-panel">
            {toast}
          </div>
        )}
      </div>
    </ToolShell>
  )
}
