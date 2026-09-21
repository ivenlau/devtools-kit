/**
 * Design presets for the QR studio — applied in one click, then fully editable.
 * Color values are qr-code-styling consumable strings.
 */

export interface QrPreset {
  id: string
  name: string
  /** Foreground fill: solid color or two-stop gradient */
  color1: string
  color2: string
  /** null → gradient fill, string → solid fill */
  finderColor: string | null
  bgColor: string
  transparentBg: boolean
  /** Fill mode applied with the preset */
  fill: 'solid' | 'linear'
}

export const qrPresets: QrPreset[] = [
  {
    id: 'classic',
    name: '经典',
    color1: '#111827',
    color2: '#374151',
    finderColor: '#111827',
    bgColor: '#FFFFFF',
    transparentBg: false,
    fill: 'solid',
  },
  {
    id: 'ocean',
    name: '海洋',
    color1: '#0077B6',
    color2: '#00E5FF',
    finderColor: null,
    bgColor: '#FFFFFF',
    transparentBg: false,
    fill: 'linear',
  },
  {
    id: 'violet',
    name: '紫罗兰',
    color1: '#7C3AED',
    color2: '#C084FC',
    finderColor: null,
    bgColor: '#FFFFFF',
    transparentBg: false,
    fill: 'linear',
  },
  {
    id: 'sunset',
    name: '日落',
    color1: '#F97316',
    color2: '#FF2D95',
    finderColor: null,
    bgColor: '#FFFFFF',
    transparentBg: false,
    fill: 'linear',
  },
  {
    id: 'mint',
    name: '薄荷',
    color1: '#0D9488',
    color2: '#5EEAD4',
    finderColor: null,
    bgColor: '#FFFFFF',
    transparentBg: false,
    fill: 'linear',
  },
  {
    id: 'midnight',
    name: '午夜',
    color1: '#E8ECF4',
    color2: '#8B96AD',
    finderColor: '#B8FF3C',
    bgColor: '#0B0D14',
    transparentBg: false,
    fill: 'solid',
  },
]

/** swatch background for the preset chip (three-stop mini preview) */
export function presetSwatch(p: QrPreset): string {
  return `linear-gradient(135deg, ${p.color1}, ${p.color2})`
}
