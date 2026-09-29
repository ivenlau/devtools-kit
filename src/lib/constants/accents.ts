/**
 * Per-tool accent colors. Dark theme uses the bright neon palette; light
 * theme uses darker tones of the same hues so borders/text keep contrast
 * on white panels.
 */
export const ACCENTS_DARK = ['#00E5FF', '#B8FF3C', '#A855F7', '#FFB020', '#FF2D95', '#FF79C6']
export const ACCENTS_LIGHT = ['#0084AD', '#549000', '#7C3AED', '#A16A00', '#C81E6E', '#B0308C']

export function accentsFor(theme: 'dark' | 'light'): string[] {
  return theme === 'light' ? ACCENTS_LIGHT : ACCENTS_DARK
}

/**
 * Accent name → tailwind classes + theme hex, shared by ToolShell and the
 * header tab strip. `box`/`line`/`tab` are literal class strings (Tailwind
 * JIT keeps them); `dark`/`light` feed the `--accent` CSS variable.
 */
export interface AccentStyle {
  /** text color class for the tool icon / active tab text */
  box: string
  /** gradient hairline class under the tool header */
  line: string
  /** solid underline class for the active tab */
  tab: string
  dark: string
  light: string
}

export const ACCENT_MAP: Record<string, AccentStyle> = {
  pink: {
    box: 'text-neon-pink',
    line: 'via-neon-pink/60',
    tab: 'bg-neon-pink',
    dark: '#FF79C6',
    light: '#B0308C',
  },
  cyan: {
    box: 'text-neon-cyan',
    line: 'via-neon-cyan/60',
    tab: 'bg-neon-cyan',
    dark: '#00E5FF',
    light: '#0084AD',
  },
  magenta: {
    box: 'text-neon-magenta',
    line: 'via-neon-magenta/60',
    tab: 'bg-neon-magenta',
    dark: '#FF2D95',
    light: '#C81E6E',
  },
  lime: {
    box: 'text-neon-lime',
    line: 'via-neon-lime/60',
    tab: 'bg-neon-lime',
    dark: '#B8FF3C',
    light: '#549000',
  },
  purple: {
    box: 'text-neon-purple',
    line: 'via-neon-purple/60',
    tab: 'bg-neon-purple',
    dark: '#A855F7',
    light: '#7C3AED',
  },
  amber: {
    box: 'text-neon-amber',
    line: 'via-neon-amber/60',
    tab: 'bg-neon-amber',
    dark: '#FFB020',
    light: '#A16A00',
  },
}
