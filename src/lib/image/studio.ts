/**
 * Image studio pipeline — all operations run on canvas, fully client-side.
 * A single render function applies: crop → rotate/flip → resize → color
 * adjustments → rounded corners → redactions → watermark.
 */

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif'
export type WatermarkPosition = 'top-left' | 'top-right' | 'center' | 'bottom-left' | 'bottom-right'
export type WatermarkLayout = 'single' | 'tile'
export type RedactMode = 'solid' | 'pixelate'

export interface Redaction {
  id: string
  mode: RedactMode
  /** percent coordinates relative to the (cropped) image */
  x: number
  y: number
  w: number
  h: number
}

export interface WatermarkSettings {
  enabled: boolean
  text: string
  layout: WatermarkLayout
  position: WatermarkPosition
  fontFamily: 'sans' | 'serif' | 'mono'
  fontWeight: 'normal' | '600' | 'bold'
  color: string
  opacity: number // 0-100
  size: number // % of min(image dim), 2-20
  rotation: number // degrees
  bgColor: string
  bgOpacity: number // 0-100
  bgPadding: number // % of font size
  shadow: boolean
  margin: number // % of min(image dim)
}

export interface ImageSettings {
  // size
  width: number
  height: number
  lockAspect: boolean
  allowUpscale: boolean
  crop: { x: number; y: number; w: number; h: number } // percent 0-100
  rotation: number // 0 | 90 | 180 | 270
  flipH: boolean
  flipV: boolean
  cornerRadius: number // % of min output dim, 0-50
  // adjust
  brightness: number // %
  contrast: number // %
  saturation: number // %
  temperature: number // -100..100
  hue: number // -180..180
  blur: number // px (relative to 1000px reference)
  grayscale: number // %
  sepia: number // % (复古色)
  // privacy
  redactions: Redaction[]
  // watermark
  watermark: WatermarkSettings
  // export
  format: ImageFormat
  quality: number // 1-100
  targetKB: number | null
  filenamePattern: string
  flattenTransparent: boolean
}

export const DEFAULT_SETTINGS: ImageSettings = {
  width: 0, // 0 = keep original
  height: 0,
  lockAspect: true,
  allowUpscale: false,
  crop: { x: 0, y: 0, w: 100, h: 100 },
  rotation: 0,
  flipH: false,
  flipV: false,
  cornerRadius: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  temperature: 0,
  hue: 0,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  redactions: [],
  watermark: {
    enabled: false,
    text: '',
    layout: 'single',
    position: 'bottom-right',
    fontFamily: 'sans',
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 72,
    size: 5,
    rotation: 0,
    bgColor: '#000000',
    bgOpacity: 28,
    bgPadding: 35,
    shadow: false,
    margin: 4,
  },
  format: 'webp',
  quality: 82,
  targetKB: null,
  filenamePattern: '{name}-optimized',
  flattenTransparent: false,
}

export interface SizePreset {
  label: string
  width: number
  height: number
}

export const SIZE_PRESETS: SizePreset[] = [
  { label: '头像', width: 384, height: 384 },
  { label: 'OG 分享图', width: 1200, height: 630 },
  { label: '网站主视觉', width: 1920, height: 1080 },
  { label: '视频缩略图', width: 1280, height: 720 },
  { label: 'IG 方图', width: 1080, height: 1080 },
  { label: 'IG 竖图', width: 1080, height: 1350 },
  { label: 'Story', width: 1080, height: 1920 },
  { label: 'X 帖子', width: 1600, height: 900 },
  { label: 'Favicon', width: 512, height: 512 },
  { label: 'PWA 图标', width: 512, height: 512 },
]

const FONT_FAMILY: Record<WatermarkSettings['fontFamily'], string> = {
  sans: 'Inter, system-ui, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v))
}

/**
 * Render the edited image to a canvas.
 * @param img source image element (already loaded)
 * @param s edit settings
 * @param maxPreviewDim cap the output for live preview (0 = full size)
 */
export function renderImage(img: HTMLImageElement, s: ImageSettings, maxPreviewDim = 0): HTMLCanvasElement {
  const srcW = img.naturalWidth
  const srcH = img.naturalHeight

  // --- crop rect in source pixels ---
  const crop = {
    x: (clamp(s.crop.x, 0, 100) / 100) * srcW,
    y: (clamp(s.crop.y, 0, 100) / 100) * srcH,
    w: Math.max(1, (clamp(s.crop.w, 1, 100) / 100) * srcW),
    h: Math.max(1, (clamp(s.crop.h, 1, 100) / 100) * srcH),
  }

  // --- output dims after rotation ---
  const rotated = s.rotation === 90 || s.rotation === 270
  let outW = s.width > 0 ? s.width : Math.round(rotated ? crop.h : crop.w)
  let outH = s.height > 0 ? s.height : Math.round(rotated ? crop.w : crop.h)

  if (!s.allowUpscale) {
    const base = rotated ? { w: crop.h, h: crop.w } : { w: crop.w, h: crop.h }
    const scale = Math.min(1, base.w / outW, base.h / outH)
    if (scale < 1) {
      outW = Math.max(1, Math.round(outW * scale))
      outH = Math.max(1, Math.round(outH * scale))
    }
  }

  // preview cap
  if (maxPreviewDim > 0 && Math.max(outW, outH) > maxPreviewDim) {
    const scale = maxPreviewDim / Math.max(outW, outH)
    outW = Math.max(1, Math.round(outW * scale))
    outH = Math.max(1, Math.round(outH * scale))
  }

  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')!
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // --- color filter (blur scales with output size) ---
  const blurScale = Math.max(outW, outH) / 1000
  const parts: string[] = []
  if (s.brightness !== 100) parts.push(`brightness(${s.brightness}%)`)
  if (s.contrast !== 100) parts.push(`contrast(${s.contrast}%)`)
  if (s.saturation !== 100) parts.push(`saturate(${s.saturation}%)`)
  if (s.hue !== 0) parts.push(`hue-rotate(${s.hue}deg)`)
  if (s.blur > 0) parts.push(`blur(${Math.max(0.1, s.blur * blurScale)}px)`)
  if (s.grayscale > 0) parts.push(`grayscale(${s.grayscale}%)`)
  if (s.sepia > 0) parts.push(`sepia(${s.sepia}%)`)
  ctx.filter = parts.length ? parts.join(' ') : 'none'

  // --- draw with crop / rotate / flip ---
  ctx.save()
  ctx.translate(outW / 2, outH / 2)
  ctx.rotate((s.rotation * Math.PI) / 180)
  ctx.scale(s.flipH ? -1 : 1, s.flipV ? -1 : 1)
  const drawW = rotated ? outH : outW
  const drawH = rotated ? outW : outH
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, -drawW / 2, -drawH / 2, drawW, drawH)
  ctx.restore()
  ctx.filter = 'none'

  // --- temperature: warm/cool overlay ---
  if (s.temperature !== 0) {
    const t = clamp(s.temperature, -100, 100)
    ctx.save()
    ctx.globalCompositeOperation = 'soft-light'
    ctx.globalAlpha = Math.abs(t) / 100 * 0.75
    ctx.fillStyle = t > 0 ? '#FF8A00' : '#0080FF'
    ctx.fillRect(0, 0, outW, outH)
    ctx.restore()
  }

  // --- rounded corners ---
  if (s.cornerRadius > 0) {
    const r = (clamp(s.cornerRadius, 0, 50) / 100) * Math.min(outW, outH)
    const clip = document.createElement('canvas')
    clip.width = outW
    clip.height = outH
    const cctx = clip.getContext('2d')!
    cctx.beginPath()
    const rr = Math.min(r, outW / 2, outH / 2)
    cctx.moveTo(rr, 0)
    cctx.arcTo(outW, 0, outW, outH, rr)
    cctx.arcTo(outW, outH, 0, outH, rr)
    cctx.arcTo(0, outH, 0, 0, rr)
    cctx.arcTo(0, 0, outW, 0, rr)
    cctx.closePath()
    cctx.drawImage(canvas, 0, 0)
    ctx.clearRect(0, 0, outW, outH)
    ctx.drawImage(clip, 0, 0)
  }

  // --- redactions (privacy) ---
  for (const r of s.redactions) {
    const rx = (clamp(r.x, 0, 100) / 100) * outW
    const ry = (clamp(r.y, 0, 100) / 100) * outH
    const rw = (clamp(r.w, 1, 100) / 100) * outW
    const rh = (clamp(r.h, 1, 100) / 100) * outH
    if (r.mode === 'solid') {
      ctx.fillStyle = '#000000'
      ctx.fillRect(rx, ry, rw, rh)
    } else {
      // pixelate: downscale then upscale without smoothing
      const cell = Math.max(4, Math.round(Math.max(rw, rh) / 10))
      const tmp = document.createElement('canvas')
      tmp.width = Math.max(1, Math.round(rw / cell))
      tmp.height = Math.max(1, Math.round(rh / cell))
      const tctx = tmp.getContext('2d')!
      tctx.imageSmoothingEnabled = true
      tctx.drawImage(canvas, rx, ry, rw, rh, 0, 0, tmp.width, tmp.height)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, rx, ry, rw, rh)
      ctx.imageSmoothingEnabled = true
    }
  }

  // --- watermark ---
  if (s.watermark.enabled && s.watermark.text.trim()) {
    drawWatermark(ctx, outW, outH, s.watermark)
  }

  return canvas
}

function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number, wm: WatermarkSettings) {
  const minDim = Math.min(w, h)
  const fontSize = Math.max(8, (wm.size / 100) * minDim)
  const margin = (wm.margin / 100) * minDim
  const pad = (wm.bgPadding / 100) * fontSize
  const font = `${wm.fontWeight} ${fontSize}px ${FONT_FAMILY[wm.fontFamily]}`
  const alpha = clamp(wm.opacity, 0, 100) / 100
  const bgAlpha = clamp(wm.bgOpacity, 0, 100) / 100

  const drawOne = (cx: number, cy: number) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate((wm.rotation * Math.PI) / 180)
    ctx.globalAlpha = alpha
    ctx.font = font
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const metrics = ctx.measureText(wm.text)
    const tw = metrics.width
    if (bgAlpha > 0) {
      ctx.globalAlpha = bgAlpha
      ctx.fillStyle = wm.bgColor
      ctx.fillRect(-tw / 2 - pad, -fontSize * 0.72 - pad * 0.5, tw + pad * 2, fontSize * 1.44 + pad)
      ctx.globalAlpha = alpha
    }
    if (wm.shadow) {
      ctx.shadowColor = 'rgba(0,0,0,0.55)'
      ctx.shadowBlur = fontSize * 0.18
      ctx.shadowOffsetY = fontSize * 0.06
    }
    ctx.fillStyle = wm.color
    ctx.fillText(wm.text, 0, 0)
    ctx.restore()
  }

  if (wm.layout === 'tile') {
    const stepX = fontSize * 12 + pad * 2
    const stepY = fontSize * 5 + pad * 2
    for (let y = -stepY / 2; y < h + stepY; y += stepY) {
      for (let x = -stepX / 2; x < w + stepX; x += stepX) {
        drawOne(x, y)
      }
    }
  } else {
    const pos = wm.position
    // keep the text fully inside: anchor accounts for the measured text extent
    ctx.font = font
    const tw = ctx.measureText(wm.text).width
    const th = fontSize
    const cx = pos.includes('left') ? margin + tw / 2 : pos === 'center' ? w / 2 : w - margin - tw / 2
    const cy = pos.startsWith('top') ? margin + th / 2 : pos === 'center' ? h / 2 : h - margin - th / 2
    drawOne(cx, cy)
  }
}

// ---------- export helpers ----------

export function canvasToBlob(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  const mime = `image/${format}`
  const q = clamp(quality, 1, 100) / 100
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))),
      mime,
      format === 'png' ? undefined : q,
    )
  })
}

const FORMATS_WITH_QUALITY: ImageFormat[] = ['jpeg', 'webp', 'avif']

/** Encode at the largest quality that stays under targetKB (quality-domain search) */
export async function canvasToBlobUnderTarget(
  canvas: HTMLCanvasElement,
  format: ImageFormat,
  targetKB: number,
): Promise<Blob> {
  if (!FORMATS_WITH_QUALITY.includes(format)) {
    return canvasToBlob(canvas, format, 100)
  }
  let lo = 1
  let hi = 100
  let best: Blob | null = null
  while (lo <= hi) {
    const mid = Math.round((lo + hi) / 2)
    const blob = await canvasToBlob(canvas, format, mid)
    if (blob.size / 1024 <= targetKB) {
      best = blob
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return best ?? canvasToBlob(canvas, format, 1)
}

export function formatExtension(f: ImageFormat): string {
  return f === 'jpeg' ? 'jpg' : f
}

export function applyFilenamePattern(
  pattern: string,
  vars: { name: string; width: number; height: number; format: ImageFormat; index: number },
): string {
  const ext = formatExtension(vars.format)
  const base = pattern
    .replace(/\{name\}/g, vars.name.replace(/\.[^.]+$/, ''))
    .replace(/\{width\}/g, String(vars.width))
    .replace(/\{height\}/g, String(vars.height))
    .replace(/\{format\}/g, ext)
    .replace(/\{index\}/g, String(vars.index + 1))
  return base.includes(ext) && /\.[a-z0-9]+$/i.test(base) ? base : `${base}.${ext}`
}

/** Paint a canvas onto a flat background (used when flattening transparency) */
export function flattenOnBackground(canvas: HTMLCanvasElement, color = '#FFFFFF'): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = canvas.width
  out.height = canvas.height
  const ctx = out.getContext('2d')!
  ctx.fillStyle = color
  ctx.fillRect(0, 0, out.width, out.height)
  ctx.drawImage(canvas, 0, 0)
  return out
}

/** True when this browser can encode the given format via canvas.toBlob */
export function supportsFormat(format: ImageFormat): boolean {
  if (format !== 'avif') return true
  const c = document.createElement('canvas')
  c.width = c.height = 2
  return c.toDataURL('image/avif').startsWith('data:image/avif')
}
