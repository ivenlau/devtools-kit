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
