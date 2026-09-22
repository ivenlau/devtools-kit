'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import QRCodeStyling, { type Options } from 'qr-code-styling'
import jsQR from 'jsqr'
import {
  QrCode, Download, Copy, Link as LinkIcon, Type, Wifi, UserRound, Mail, Phone,
  MessageSquare, MapPin, CalendarDays, ScanLine, AlertTriangle, CheckCircle2,
  RotateCcw, ImagePlus, X,
} from 'lucide-react'
import { useTransferData } from '@/lib/useTransferData'
import { ToolShell } from '@/components/ToolShell'
import { useI18n } from '@/components/I18nProvider'
import { buildPayload, byteLength, type ContentType } from '@/lib/qr/payloads'
import { qrPresets, presetSwatch } from '@/lib/qr/presets'

type DotStyle = 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded'
type CornerSquareStyle = 'square' | 'dot' | 'extra-rounded'
type CornerDotStyle = 'square' | 'dot'
type FillMode = 'solid' | 'linear' | 'radial'
type FrameStyle = 'none' | 'card' | 'banner'
type ExportFormat = 'png' | 'svg' | 'webp' | 'jpeg'

interface QrConfig {
  type: ContentType
  url: string
  text: string
  wifi: { ssid: string; security: 'WPA' | 'WEP' | 'nopass'; password: string; hidden: boolean }
  vcard: { firstName: string; lastName: string; org: string; title: string; phone: string; email: string; website: string; address: string }
  email: { to: string; subject: string; body: string }
  phone: string
  sms: { phone: string; body: string }
  geo: { lat: string; lng: string }
  event: { title: string; start: string; end: string; location: string; description: string }
  preset: string
  dotStyle: DotStyle
  fillMode: FillMode
  color1: string
  color2: string
  finderAuto: boolean
  finderColor: string
  bgColor: string
  transparentBg: boolean
  shape: 'square' | 'circle'
  ecc: 'L' | 'M' | 'Q' | 'H'
  margin: number
  cornerSquareType: CornerSquareStyle
  cornerDotType: CornerDotStyle
  logoUrl: string | null
  logoSize: number
  logoMargin: number
  hideBgDots: boolean
  frameStyle: FrameStyle
  caption: string
  frameColor: string
  textColor: string
  fileName: string
  format: ExportFormat
  exportSize: number
}

const DEFAULT_CONFIG: QrConfig = {
  type: 'url',
  url: 'https://github.com',
  text: '',
  wifi: { ssid: '', security: 'WPA', password: '', hidden: false },
  vcard: { firstName: '', lastName: '', org: '', title: '', phone: '', email: '', website: '', address: '' },
  email: { to: '', subject: '', body: '' },
  phone: '',
  sms: { phone: '', body: '' },
  geo: { lat: '', lng: '' },
  event: { title: '', start: '', end: '', location: '', description: '' },
  preset: 'classic',
  dotStyle: 'extra-rounded',
  fillMode: 'solid',
  color1: '#111827',
  color2: '#374151',
  finderAuto: true,
  finderColor: '#111827',
  bgColor: '#FFFFFF',
  transparentBg: false,
  shape: 'square',
  ecc: 'Q',
  margin: 20,
  cornerSquareType: 'extra-rounded',
  cornerDotType: 'dot',
  logoUrl: null,
  logoSize: 22,
  logoMargin: 6,
  hideBgDots: true,
  frameStyle: 'none',
  caption: '',
  frameColor: '#FFFFFF',
  textColor: '#111827',
  fileName: 'qrcode',
  format: 'png',
  exportSize: 1024,
}

const CONTENT_TABS: { id: ContentType; icon: typeof LinkIcon; label: string }[] = [
  { id: 'url', icon: LinkIcon, label: '网址' },
  { id: 'text', icon: Type, label: '文本' },
  { id: 'wifi', icon: Wifi, label: 'Wi-Fi' },
  { id: 'vcard', icon: UserRound, label: '联系人' },
  { id: 'email', icon: Mail, label: '邮件' },
  { id: 'phone', icon: Phone, label: '电话' },
  { id: 'sms', icon: MessageSquare, label: '短信' },
  { id: 'geo', icon: MapPin, label: '位置' },
  { id: 'event', icon: CalendarDays, label: '日程' },
]

const DOT_STYLES: { id: DotStyle; label: string }[] = [
  { id: 'square', label: '方形' },
  { id: 'dots', label: '圆点' },
  { id: 'rounded', label: '圆角' },
  { id: 'classy', label: '简约' },
  { id: 'classy-rounded', label: '圆润简约' },
  { id: 'extra-rounded', label: '大圆角' },
]

const FILL_MODES: { id: FillMode; label: string }[] = [
  { id: 'solid', label: '纯色' },
  { id: 'linear', label: '线性渐变' },
  { id: 'radial', label: '径向渐变' },
]

const EXPORT_SIZES = [512, 1024, 1536, 2048]
/** margin slider is calibrated against this reference size and scales proportionally */
const REF_SIZE = 512
const PREVIEW_MIN = 288
const PREVIEW_MAX = 720
const STORAGE_KEY = 'devtools-kit:qr-design'

/** Restore the last session's config from localStorage (best effort) */
function loadStoredConfig(): QrConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw)
    if (parsed?.app === 'devtools-kit-qr' && parsed.config) {
      return { ...DEFAULT_CONFIG, ...parsed.config }
    }
  } catch {
    /* corrupted storage — fall back to defaults */
  }
  return DEFAULT_CONFIG
}

const inputCls =
  'w-full min-w-0 rounded-md border border-border-dim bg-void-200 px-3 py-2 font-mono text-sm text-ink-primary placeholder:text-ink-muted focus:border-neon-cyan focus:outline-none'
const labelCls = 'mb-2 block font-mono text-[11px] text-ink-muted'

function TextField({ label, value, onChange, placeholder, type = 'text' }: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} spellCheck={false} />
    </div>
  )
}

function ColorField({ label, value, onChange, disabled }: {
  label: string
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  return (
    <div className={disabled ? 'pointer-events-none opacity-40' : ''}>
      <label className={labelCls}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-border-dim bg-void-200 p-1"
        />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} className={inputCls} />
      </div>
    </div>
  )
}

function Toggle({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`chip ${on ? 'chip-active' : ''}`}>
      {on ? '■ ' : '□ '}
      {label}
    </button>
  )
}

/** Rounded-rect path helper (works without ctx.roundRect on older engines) */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export default function QRCodeStudioPage() {
  const { t } = useI18n()
  // Start from defaults so SSR markup matches, then adopt the stored session
  // after mount (avoids a hydration mismatch when localStorage differs).
  const [cfg, setCfg] = useState<QrConfig>(DEFAULT_CONFIG)
  const [restored, setRestored] = useState(false)
  const [tab, setTab] = useState<'content' | 'design' | 'logo' | 'frame' | 'export'>('content')
  const [qrError, setQrError] = useState<string | null>(null)
  const [scanState, setScanState] = useState<'idle' | 'checking' | 'pass' | 'fail'>('idle')
  const [testResult, setTestResult] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const centerAreaRef = useRef<HTMLDivElement>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  // preview canvas follows the available panel space (bounded)
  const [previewPx, setPreviewPx] = useState(REF_SIZE)

  const patch = useCallback((p: Partial<QrConfig>) => setCfg((c) => ({ ...c, ...p })), [])

  // Restore the last session after mount, then keep auto-saving changes
  useEffect(() => {
    setCfg(loadStoredConfig())
    setRestored(true)
  }, [])
  useEffect(() => {
    if (!restored) return
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ app: 'devtools-kit-qr', version: 1, config: cfg }))
      } catch {
        /* storage quota (e.g. large logo) — keep working without persistence */
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [cfg, restored])

  // Paste from the home screen routes into the URL field
  useTransferData(
    useCallback((v: string) => setCfg((c) => ({ ...c, type: 'url', url: v })), []),
  )

  const payload = useMemo(
    () =>
      buildPayload(cfg.type, {
        url: cfg.url,
        text: cfg.text,
        ...(cfg.wifi as unknown as Record<string, unknown>),
        ...(cfg.vcard as unknown as Record<string, unknown>),
        ...(cfg.email as unknown as Record<string, unknown>),
        ...(cfg.sms as unknown as Record<string, unknown>),
        phone: cfg.type === 'phone' ? cfg.phone : cfg.sms.phone,
        ...(cfg.geo as unknown as Record<string, unknown>),
        ...(cfg.event as unknown as Record<string, unknown>),
      }),
    [cfg],
  )
  const payloadBytes = byteLength(payload)

  // Build qr-code-styling options from the current config
  const buildOptions = useCallback(
    (size: number): Options => {
      const gradient =
        cfg.fillMode === 'solid'
          ? undefined
          : {
              type: (cfg.fillMode === 'linear' ? 'linear' : 'radial') as 'linear' | 'radial',
              rotation: cfg.fillMode === 'linear' ? (45 * Math.PI) / 180 : 0,
              colorStops: [
                { offset: 0, color: cfg.color1 },
                { offset: 1, color: cfg.color2 },
              ],
            }
      const finderGradient = cfg.finderAuto ? gradient : undefined
      return {
        type: 'canvas',
        width: size,
        height: size,
        shape: cfg.shape,
        // WYSIWYG: keep the quiet zone proportional to the reference size at every export size
        margin: Math.round((cfg.margin * size) / REF_SIZE),
        data: payload,
        qrOptions: { errorCorrectionLevel: cfg.ecc },
        dotsOptions: {
          type: cfg.dotStyle,
          color: cfg.color1,
          gradient,
          roundSize: true,
        },
        cornersSquareOptions: {
          type: cfg.cornerSquareType,
          color: cfg.finderAuto ? cfg.color1 : cfg.finderColor,
          gradient: finderGradient,
        },
        cornersDotOptions: {
          type: cfg.cornerDotType,
          color: cfg.finderAuto ? cfg.color1 : cfg.finderColor,
          gradient: finderGradient,
        },
        backgroundOptions: { color: cfg.transparentBg ? 'rgba(0,0,0,0)' : cfg.bgColor },
        image: cfg.logoUrl ?? undefined,
        imageOptions: {
          hideBackgroundDots: cfg.hideBgDots,
          imageSize: cfg.logoSize / 100,
          margin: cfg.logoMargin,
        },
      }
    },
    [cfg, payload],
  )

  // Track the preview area so the canvas fills the available space
  useEffect(() => {
    const el = centerAreaRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect()
      if (width < 40 || height < 40) return
      const target = Math.max(PREVIEW_MIN, Math.min(PREVIEW_MAX, Math.floor(Math.min(width, height) - 64)))
      setPreviewPx(Math.round(target / 64) * 64)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Init the styling instance once; later changes go through update()
  useEffect(() => {
    if (!containerRef.current || qrRef.current) return
    try {
      qrRef.current = new QRCodeStyling({ ...(buildOptions(previewPx) as Options) })
      qrRef.current.append(containerRef.current)
      setQrError(null)
    } catch {
      setQrError('overflow')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const instance = qrRef.current
    if (!instance) return
    try {
      // empty data → update() just clears the canvas, no throw
      instance.update(buildOptions(previewPx))
      setQrError(payload ? null : 'empty')
    } catch {
      setQrError('overflow')
    }
  }, [payload, buildOptions, previewPx])

  /** Render the QR at `size` off-screen and try to decode it with jsQR */
  const scanCurrent = useCallback(
    async (size: number): Promise<boolean> => {
      const instance = new QRCodeStyling({ ...(buildOptions(size) as Options) })
      const blob = (await instance.getRawData('png')) as Blob | null
      if (!blob) return false
      const bitmap = await createImageBitmap(blob)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return false
      ctx.drawImage(bitmap, 0, 0)
      bitmap.close()
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const result = jsQR(imageData.data, imageData.width, imageData.height)
      return !!result
    },
    [buildOptions],
  )

  // Auto scan check (debounced) — verifies the preview is actually decodable
  useEffect(() => {
    if (!payload || qrError) {
      setScanState('idle')
      return
    }
    setScanState('checking')
    const timer = setTimeout(async () => {
      try {
        const ok = await scanCurrent(512)
        setScanState(ok ? 'pass' : 'fail')
      } catch {
        setScanState('fail')
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [payload, qrError, scanCurrent])

  const runScanTest = async () => {
    setTestResult(null)
    try {
      const ok = await scanCurrent(Math.max(cfg.exportSize, 512))
      setTestResult(ok ? 'pass' : 'fail')
    } catch {
      setTestResult('fail')
    }
  }

  // ---------- Export ----------

  /** Compose the QR bitmap with the selected frame decoration */
  const composeFrame = async (qrBlob: Blob, size: number): Promise<Blob> => {
    const bitmap = await createImageBitmap(qrBlob)
    const capText = cfg.caption
    const s = size / 1024 // decoration scales relative to 1024 output
    let outW = size
    let outH = size
    if (cfg.frameStyle === 'card') {
      outW = Math.round(size + 128 * s)
      outH = Math.round(size + (capText ? 232 : 128) * s)
    } else if (cfg.frameStyle === 'banner') {
      outW = Math.round(size + 96 * s)
      outH = Math.round(size + (capText ? 224 : 128) * s)
    }
    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')!
    if (cfg.format === 'jpeg') {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, outW, outH)
    }
    if (cfg.frameStyle === 'card') {
      ctx.fillStyle = cfg.frameColor
      roundRect(ctx, 0, 0, outW, outH, 28 * s)
      ctx.fill()
      const qrX = (outW - size) / 2
      ctx.drawImage(bitmap, qrX, 64 * s, size, size)
      if (capText) {
        ctx.fillStyle = cfg.textColor
        ctx.font = `600 ${Math.round(52 * s)}px Inter, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(capText, outW / 2, outH - 68 * s, outW - 96 * s)
      }
    } else if (cfg.frameStyle === 'banner') {
      // neutral plate + colored band on top
      ctx.fillStyle = '#FFFFFF'
      roundRect(ctx, 0, 0, outW, outH, 28 * s)
      ctx.fill()
      const bandH = Math.round(128 * s)
      ctx.fillStyle = cfg.frameColor
      roundRect(ctx, 0, 0, outW, outH, 28 * s)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      roundRect(ctx, 0, bandH, outW, outH - bandH, 0)
      ctx.fill()
      if (capText) {
        ctx.fillStyle = cfg.textColor
        ctx.font = `700 ${Math.round(52 * s)}px Inter, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(capText, outW / 2, bandH / 2, outW - 96 * s)
      }
      const qrX = (outW - size) / 2
      ctx.drawImage(bitmap, qrX, bandH + 32 * s, size, size)
    }
    bitmap.close()
    return await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), `image/${cfg.format}`, cfg.format === 'png' ? undefined : 0.95),
    )
  }

  const downloadQR = async () => {
    if (!payload) return
    try {
      if (cfg.format === 'svg') {
        const instance = new QRCodeStyling({ ...(buildOptions(cfg.exportSize) as Options), type: 'svg' })
        const blob = (await instance.getRawData('svg')) as Blob | null
        if (blob) saveBlob(blob, `${cfg.fileName || 'qrcode'}.svg`)
        return
      }
      // JPEG has no alpha — swap a transparent background for white
      const opts = buildOptions(cfg.exportSize) as Options
      if (cfg.format === 'jpeg' && cfg.transparentBg) {
        opts.backgroundOptions = { color: '#FFFFFF' }
      }
      const instance = new QRCodeStyling(opts)
      const blob = (await instance.getRawData(cfg.format)) as Blob | null
      if (!blob) return
      const finalBlob = cfg.frameStyle !== 'none' ? await composeFrame(blob, cfg.exportSize) : blob
      const ext = cfg.format === 'jpeg' ? 'jpg' : cfg.format
      saveBlob(finalBlob, `${cfg.fileName || 'qrcode'}.${ext}`)
    } catch {
      /* data overflow or canvas failure — surfaced via the scan badge */
    }
  }

  const copyPNG = async () => {
    if (!payload) return
    try {
      const instance = new QRCodeStyling(buildOptions(1024) as Options)
      const blob = (await instance.getRawData('png')) as Blob | null
      if (!blob) return
      const finalBlob = cfg.frameStyle !== 'none' ? await composeFrame(blob, 1024) : blob
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': finalBlob })])
      setTestResult('copied')
    } catch {
      setTestResult('copy-fail')
    }
  }

  const saveBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  // ---------- Logo ----------

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        // Downscale big logos in-browser before embedding
        const MAX = 512
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        patch({ logoUrl: canvas.toDataURL('image/png') })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  // ---------- Reset (also clears the locally saved session) ----------

  const resetAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setCfg(DEFAULT_CONFIG)
  }

  return (
    <ToolShell
      title="QRCODE"
      description={t('二维码设计：多种内容类型 + 点阵样式 + Logo + 边框 + 多格式导出')}
      path="/tools/qrcode"
      icon={QrCode}
      actions={
        <>
          <button onClick={resetAll} className="tool-btn tool-btn-icon" title={t('重置')} aria-label={t('重置')}>
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button onClick={copyPNG} disabled={!payload} className="tool-btn tool-btn-icon" title={t('复制 PNG')} aria-label={t('复制 PNG')}>
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button onClick={downloadQR} disabled={!payload} className="tool-btn tool-btn-icon tool-btn-accent" title={t('下载二维码')} aria-label={t('下载二维码')}>
            <Download className="h-3.5 w-3.5" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="grid grid-cols-1 gap-3 lg:h-[calc(100dvh-var(--header-total)-4.5rem)] lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)]">
        {/* ============ Left: settings ============ */}
        <div className="tool-panel min-h-[400px] lg:h-full">
          <div className="tool-panel-head">
            <span className="text-neon-cyan">&gt;_</span>
            <span>STUDIO</span>
            <span className="ml-auto normal-case tracking-normal">{t('本地处理 · 不上传')}</span>
          </div>
          {/* tab chips */}
          <div className="flex flex-wrap gap-1.5 border-b border-border-dim px-3 py-2.5">
            {(
              [
                ['content', '内容'],
                ['design', '设计'],
                ['logo', 'Logo'],
                ['frame', '边框'],
                ['export', '导出'],
              ] as const
            ).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`chip ${tab === id ? 'chip-active' : ''}`}>
                {t(label)}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
            {/* ================= CONTENT ================= */}
            {tab === 'content' && (
              <>
                <div>
                  <label className={labelCls}>{t('二维码内容')}</label>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
                    {CONTENT_TABS.map(({ id, icon: Icon, label }) => (
                      <button
                        key={id}
                        onClick={() => patch({ type: id })}
                        className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 font-mono text-[11px] transition-all ${
                          cfg.type === id
                            ? 'border-neon-cyan bg-neon-cyan/10 text-neon-cyan shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                            : 'border-border-dim bg-void-200 text-ink-secondary hover:border-border-glow hover:text-ink-primary'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {t(label)}
                      </button>
                    ))}
                  </div>
                </div>

                {cfg.type === 'url' && (
                  <TextField label={t('网站地址')} value={cfg.url} onChange={(v) => patch({ url: v })} placeholder="https://example.com" />
                )}
                {cfg.type === 'text' && (
                  <div>
                    <label className={labelCls}>{t('文本内容')}</label>
                    <textarea
                      value={cfg.text}
                      onChange={(e) => patch({ text: e.target.value })}
                      rows={5}
                      placeholder={t('输入任意文本…')}
                      spellCheck={false}
                      className={`${inputCls} resize-none`}
                    />
                  </div>
                )}
                {cfg.type === 'wifi' && (
                  <div className="space-y-4">
                    <TextField label={t('网络名称 (SSID)')} value={cfg.wifi.ssid} onChange={(v) => patch({ wifi: { ...cfg.wifi, ssid: v } })} placeholder="My-WiFi" />
                    <div>
                      <label className={labelCls}>{t('安全类型')}</label>
                      <div className="flex gap-2">
                        {(
                          [
                            ['WPA', 'WPA/WPA2/WPA3'],
                            ['WEP', 'WEP'],
                            ['nopass', '无密码'],
                          ] as const
                        ).map(([id, label]) => (
                          <button
                            key={id}
                            onClick={() => patch({ wifi: { ...cfg.wifi, security: id } })}
                            className={`chip flex-1 justify-center ${cfg.wifi.security === id ? 'chip-active' : ''}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {cfg.wifi.security !== 'nopass' && (
                      <TextField label={t('Wi-Fi 密码')} value={cfg.wifi.password} onChange={(v) => patch({ wifi: { ...cfg.wifi, password: v } })} />
                    )}
                    <Toggle label={t('隐藏网络')} on={cfg.wifi.hidden} onToggle={() => patch({ wifi: { ...cfg.wifi, hidden: !cfg.wifi.hidden } })} />
                  </div>
                )}
                {cfg.type === 'vcard' && (
                  <div className="grid grid-cols-2 gap-4">
                    <TextField label={t('名')} value={cfg.vcard.firstName} onChange={(v) => patch({ vcard: { ...cfg.vcard, firstName: v } })} />
                    <TextField label={t('姓')} value={cfg.vcard.lastName} onChange={(v) => patch({ vcard: { ...cfg.vcard, lastName: v } })} />
                    <TextField label={t('组织')} value={cfg.vcard.org} onChange={(v) => patch({ vcard: { ...cfg.vcard, org: v } })} />
                    <TextField label={t('职位')} value={cfg.vcard.title} onChange={(v) => patch({ vcard: { ...cfg.vcard, title: v } })} />
                    <TextField label={t('电话号码')} value={cfg.vcard.phone} onChange={(v) => patch({ vcard: { ...cfg.vcard, phone: v } })} placeholder="+86 138 0000 0000" />
                    <TextField label={t('邮箱地址')} value={cfg.vcard.email} onChange={(v) => patch({ vcard: { ...cfg.vcard, email: v } })} />
                    <TextField label={t('网站')} value={cfg.vcard.website} onChange={(v) => patch({ vcard: { ...cfg.vcard, website: v } })} />
                    <TextField label={t('地址')} value={cfg.vcard.address} onChange={(v) => patch({ vcard: { ...cfg.vcard, address: v } })} />
                  </div>
                )}
                {cfg.type === 'email' && (
                  <div className="space-y-4">
                    <TextField label={t('收件人')} value={cfg.email.to} onChange={(v) => patch({ email: { ...cfg.email, to: v } })} placeholder="name@example.com" />
                    <TextField label={t('主题')} value={cfg.email.subject} onChange={(v) => patch({ email: { ...cfg.email, subject: v } })} />
                    <TextField label={t('内容')} value={cfg.email.body} onChange={(v) => patch({ email: { ...cfg.email, body: v } })} />
                  </div>
                )}
                {cfg.type === 'phone' && (
                  <TextField label={t('电话号码')} value={cfg.phone} onChange={(v) => patch({ phone: v })} placeholder="+86 138 0000 0000" />
                )}
                {cfg.type === 'sms' && (
                  <div className="space-y-4">
                    <TextField label={t('电话号码')} value={cfg.sms.phone} onChange={(v) => patch({ sms: { ...cfg.sms, phone: v } })} placeholder="+86 138 0000 0000" />
                    <TextField label={t('内容')} value={cfg.sms.body} onChange={(v) => patch({ sms: { ...cfg.sms, body: v } })} />
                  </div>
                )}
                {cfg.type === 'geo' && (
                  <div className="grid grid-cols-2 gap-4">
                    <TextField label={t('纬度')} value={cfg.geo.lat} onChange={(v) => patch({ geo: { ...cfg.geo, lat: v } })} placeholder="31.2304" />
                    <TextField label={t('经度')} value={cfg.geo.lng} onChange={(v) => patch({ geo: { ...cfg.geo, lng: v } })} placeholder="121.4737" />
                  </div>
                )}
                {cfg.type === 'event' && (
                  <div className="space-y-4">
                    <TextField label={t('日程标题')} value={cfg.event.title} onChange={(v) => patch({ event: { ...cfg.event, title: v } })} />
                    <div className="grid grid-cols-2 gap-4">
                      <TextField label={t('开始时间')} type="datetime-local" value={cfg.event.start} onChange={(v) => patch({ event: { ...cfg.event, start: v } })} />
                      <TextField label={t('结束时间')} type="datetime-local" value={cfg.event.end} onChange={(v) => patch({ event: { ...cfg.event, end: v } })} />
                    </div>
                    <TextField label={t('地点')} value={cfg.event.location} onChange={(v) => patch({ event: { ...cfg.event, location: v } })} />
                    <TextField label={t('日程说明')} value={cfg.event.description} onChange={(v) => patch({ event: { ...cfg.event, description: v } })} />
                  </div>
                )}
              </>
            )}

            {/* ================= DESIGN ================= */}
            {tab === 'design' && (
              <>
                <div>
                  <label className={labelCls}>{t('设计预设')}</label>
                  <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
                    {qrPresets.map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          patch({
                            preset: p.id,
                            color1: p.color1,
                            color2: p.color2,
                            bgColor: p.bgColor,
                            transparentBg: p.transparentBg,
                            fillMode: p.fill,
                            finderAuto: p.finderColor === null,
                            finderColor: p.finderColor ?? p.color1,
                          })
                        }
                        className={`flex flex-col items-center gap-1.5 rounded-md border px-1 py-2 transition-all ${
                          cfg.preset === p.id ? 'border-neon-cyan bg-neon-cyan/10' : 'border-border-dim bg-void-200 hover:border-border-glow'
                        }`}
                      >
                        <span className="h-5 w-8 rounded-sm border border-border-glow" style={{ background: presetSwatch(p) }} />
                        <span className="font-mono text-[10px] text-ink-secondary">{t(p.name)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>{t('点阵样式')}</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {DOT_STYLES.map((s) => (
                      <button key={s.id} onClick={() => patch({ dotStyle: s.id })} className={`chip justify-center ${cfg.dotStyle === s.id ? 'chip-active' : ''}`}>
                        {t(s.label)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>{t('填色方式')}</label>
                    <div className="flex gap-2">
                      {FILL_MODES.map((m) => (
                        <button key={m.id} onClick={() => patch({ fillMode: m.id })} className={`chip flex-1 justify-center ${cfg.fillMode === m.id ? 'chip-active' : ''}`}>
                          {t(m.label)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{t('纠错级别')}</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(
                        [
                          ['L', '7%'],
                          ['M', '15%'],
                          ['Q', '25%'],
                          ['H', '30%'],
                        ] as const
                      ).map(([id, pct]) => (
                        <button key={id} onClick={() => patch({ ecc: id })} className={`chip justify-center whitespace-nowrap px-1.5 ${cfg.ecc === id ? 'chip-active' : ''}`}>
                          {id} · {pct}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ColorField label={t('主色')} value={cfg.color1} onChange={(v) => patch({ color1: v })} />
                  {cfg.fillMode !== 'solid' ? (
                    <ColorField label={t('副色')} value={cfg.color2} onChange={(v) => patch({ color2: v })} />
                  ) : (
                    <div className="flex items-end pb-1">
                      <Toggle label={t('透明背景')} on={cfg.transparentBg} onToggle={() => patch({ transparentBg: !cfg.transparentBg })} />
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>{t('定位框')}</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          ['square', '方形'],
                          ['dot', '圆点'],
                          ['extra-rounded', '大圆角'],
                        ] as const
                      ).map(([id, label]) => (
                        <button key={id} onClick={() => patch({ cornerSquareType: id })} className={`chip justify-center ${cfg.cornerSquareType === id ? 'chip-active' : ''}`}>
                          {t(label)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{t('定位点')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          ['square', '方形'],
                          ['dot', '圆点'],
                        ] as const
                      ).map(([id, label]) => (
                        <button key={id} onClick={() => patch({ cornerDotType: id })} className={`chip justify-center ${cfg.cornerDotType === id ? 'chip-active' : ''}`}>
                          {t(label)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Toggle label={t('定位图形跟随主色')} on={cfg.finderAuto} onToggle={() => patch({ finderAuto: !cfg.finderAuto })} />
                    {!cfg.finderAuto && <ColorField label={t('定位图形颜色')} value={cfg.finderColor} onChange={(v) => patch({ finderColor: v })} />}
                  </div>
                  <ColorField label={t('背景颜色')} value={cfg.bgColor} onChange={(v) => patch({ bgColor: v })} disabled={cfg.transparentBg} />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelCls}>{t('二维码边界')}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          ['square', '方形'],
                          ['circle', '圆形'],
                        ] as const
                      ).map(([id, label]) => (
                        <button key={id} onClick={() => patch({ shape: id })} className={`chip justify-center ${cfg.shape === id ? 'chip-active' : ''}`}>
                          {t(label)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>
                      {t('留白边距')}: {cfg.margin}px
                    </label>
                    <input type="range" min={0} max={40} value={cfg.margin} onChange={(e) => patch({ margin: Number(e.target.value) })} className="w-full accent-neon-cyan" />
                  </div>
                </div>
              </>
            )}

            {/* ================= LOGO ================= */}
            {tab === 'logo' && (
              <>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleLogoFile(f)
                    e.target.value = ''
                  }}
                />
                {!cfg.logoUrl ? (
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed border-border-glow bg-void-200/50 px-4 py-8 text-ink-muted transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                  >
                    <ImagePlus className="h-7 w-7" />
                    <span className="font-mono text-xs">{t('拖入或选择 Logo')}</span>
                    <span className="font-mono text-[10px]">PNG · JPG · WebP · SVG</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border-dim bg-void-200 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cfg.logoUrl} alt="logo" className="h-12 w-12 rounded-md border border-border-glow object-contain" />
                    <button onClick={() => logoInputRef.current?.click()} className="tool-btn ml-auto">
                      {t('更换')}
                    </button>
                    <button onClick={() => patch({ logoUrl: null })} className="tool-btn tool-btn-icon tool-btn-danger" aria-label={t('移除 Logo')}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className={cfg.logoUrl ? '' : 'pointer-events-none opacity-40'}>
                  <label className={labelCls}>
                    {t('Logo 大小')}: {cfg.logoSize}%
                  </label>
                  <input type="range" min={8} max={40} value={cfg.logoSize} onChange={(e) => patch({ logoSize: Number(e.target.value) })} className="w-full accent-neon-cyan" />
                </div>
                <div className={cfg.logoUrl ? '' : 'pointer-events-none opacity-40'}>
                  <label className={labelCls}>
                    {t('Logo 间距')}: {cfg.logoMargin}px
                  </label>
                  <input type="range" min={0} max={20} value={cfg.logoMargin} onChange={(e) => patch({ logoMargin: Number(e.target.value) })} className="w-full accent-neon-cyan" />
                </div>
                <Toggle label={t('清除 Logo 后方点阵')} on={cfg.hideBgDots} onToggle={() => patch({ hideBgDots: !cfg.hideBgDots })} />
                <p className="font-mono text-[10px] leading-relaxed text-ink-muted">{t('Logo 会嵌入图片并保持纵横比；建议使用 H 级纠错以保证可扫描性。')}</p>
              </>
            )}

            {/* ================= FRAME ================= */}
            {tab === 'frame' && (
              <>
                <div>
                  <label className={labelCls}>{t('边框样式')}</label>
                  <div className="flex gap-2">
                    {(
                      [
                        ['none', '无边框'],
                        ['card', '卡片'],
                        ['banner', '标签'],
                      ] as const
                    ).map(([id, label]) => (
                      <button key={id} onClick={() => patch({ frameStyle: id })} className={`chip flex-1 justify-center ${cfg.frameStyle === id ? 'chip-active' : ''}`}>
                        {t(label)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={cfg.frameStyle === 'none' ? 'pointer-events-none opacity-40' : ''}>
                  <TextField label={t('说明文字')} value={cfg.caption} onChange={(v) => patch({ caption: v })} placeholder={t('扫码打开')} />
                  <p className="mt-1.5 font-mono text-[10px] text-ink-muted">{t('说明文字会包含在下载文件中。')}</p>
                </div>
                <div className={cfg.frameStyle === 'none' ? 'grid grid-cols-2 gap-4 opacity-40' : 'grid grid-cols-2 gap-4'}>
                  <ColorField label={t('边框颜色')} value={cfg.frameColor} onChange={(v) => patch({ frameColor: v })} />
                  <ColorField label={t('文字颜色')} value={cfg.textColor} onChange={(v) => patch({ textColor: v })} />
                </div>
                <p className="font-mono text-[10px] leading-relaxed text-ink-muted">{t('边框仅应用于位图导出（PNG / JPG / WebP），SVG 为纯二维码。')}</p>
              </>
            )}

            {/* ================= EXPORT ================= */}
            {tab === 'export' && (
              <>
                <TextField label={t('文件名')} value={cfg.fileName} onChange={(v) => patch({ fileName: v })} placeholder="qrcode" />
                <div>
                  <label className={labelCls}>{t('格式')}</label>
                  <div className="flex gap-2">
                    {(['png', 'svg', 'webp', 'jpeg'] as const).map((f) => (
                      <button key={f} onClick={() => patch({ format: f })} className={`chip flex-1 justify-center uppercase ${cfg.format === f ? 'chip-active' : ''}`}>
                        {f === 'jpeg' ? 'jpg' : f}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={labelCls}>
                    {t('输出尺寸')}: {cfg.exportSize}px
                  </label>
                  <input type="range" min={512} max={2048} step={512} value={cfg.exportSize} onChange={(e) => patch({ exportSize: Number(e.target.value) })} className="w-full accent-neon-cyan" />
                  <div className="mt-2 flex gap-2">
                    {EXPORT_SIZES.map((s) => (
                      <button key={s} onClick={() => patch({ exportSize: s })} className={`chip flex-1 justify-center ${cfg.exportSize === s ? 'chip-active' : ''}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={downloadQR} disabled={!payload} className="tool-btn tool-btn-accent w-full justify-center py-2.5">
                  <Download className="h-4 w-4" />
                  {t('下载二维码')} · {cfg.format.toUpperCase()} {cfg.exportSize}px
                </button>
              </>
            )}
          </div>
        </div>

        {/* ============ Right: preview ============ */}
        <div className="tool-panel min-h-[400px] lg:h-full">
          <div className="tool-panel-head">
            <span className="text-neon-cyan">&gt;_</span>
            <span>PREVIEW</span>
            <span className="ml-auto normal-case tracking-normal">
              {payloadBytes} B · {t('纠错')} {cfg.ecc}
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">
          <div ref={centerAreaRef} className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto p-6">
            {/* checkerboard backdrop when transparent */}
            <div
              className={`flex max-h-full items-center justify-center rounded-lg border border-border-glow p-4 ${payload ? '' : 'hidden'}`}
              style={{
                background: cfg.transparentBg
                  ? 'repeating-conic-gradient(#2a3558 0% 25%, #1a2035 0% 50%) 50% / 16px 16px'
                  : undefined,
              }}
            >
              <div ref={containerRef} className="max-h-full [&_canvas]:block [&_canvas]:h-auto [&_canvas]:max-h-full [&_canvas]:max-w-full [&_canvas]:w-auto" />
            </div>

            {!payload ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <AlertTriangle className="h-8 w-8 text-ink-muted" />
                <p className="font-mono text-xs text-ink-secondary">{t('输入内容后生成二维码')}</p>
              </div>
            ) : qrError === 'overflow' ? (
              <div className="flex items-center gap-2 rounded-md border border-neon-red/40 bg-neon-red/10 px-3 py-1.5 font-mono text-xs text-neon-red">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t('数据超出二维码容量，请缩短内容')}
              </div>
            ) : scanState === 'pass' ? (
              <div className="flex items-center gap-2 rounded-md border border-neon-lime/40 bg-neon-lime/10 px-3 py-1.5 font-mono text-xs text-neon-lime">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t('扫描通过')}
              </div>
            ) : scanState === 'fail' ? (
              <div className="flex items-center gap-2 rounded-md border border-neon-red/40 bg-neon-red/10 px-3 py-1.5 font-mono text-xs text-neon-red">
                <AlertTriangle className="h-3.5 w-3.5" />
                {t('扫描失败：请提高纠错级别或增强对比度')}
              </div>
            ) : scanState === 'checking' ? (
              <div className="flex items-center gap-2 rounded-md border border-border-glow bg-void-200 px-3 py-1.5 font-mono text-xs text-ink-muted">
                <ScanLine className="h-3.5 w-3.5 animate-pulse" />
                {t('校验可扫描性…')}
              </div>
            ) : null}

          </div>

          {/* bottom bar: scan test + encoded payload */}
          {payload && (
            <div className="shrink-0 space-y-3 border-t border-border-dim p-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button onClick={runScanTest} disabled={qrError === 'overflow'} className="tool-btn">
                  <ScanLine className="h-3.5 w-3.5" />
                  {t('运行扫描测试')}
                </button>
                {testResult === 'pass' && <span className="font-mono text-[11px] text-neon-lime">{t('测试通过')}</span>}
                {testResult === 'fail' && <span className="font-mono text-[11px] text-neon-red">{t('测试失败')}</span>}
                {testResult === 'copied' && <span className="font-mono text-[11px] text-neon-lime">{t('已复制到剪贴板')}</span>}
                {testResult === 'copy-fail' && <span className="font-mono text-[11px] text-neon-red">{t('复制失败，请改用下载')}</span>}
              </div>

              {/* payload preview */}
              <div className="rounded-md bg-void-200 p-3">
                <p className="max-h-20 break-all overflow-y-auto whitespace-pre-wrap font-mono text-xs text-ink-secondary">{payload}</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </ToolShell>
  )
}
