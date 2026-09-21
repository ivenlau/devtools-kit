/** Rebuild a File from a base64 data URL (used by the transfer store handoff) */
export function dataUrlToFile(dataUrl: string, fileName: string, mimeType?: string): File | null {
  try {
    const base64 = dataUrl.split(',')[1]
    if (!base64) return null
    const byteString = atob(base64)
    const ab = new ArrayBuffer(byteString.length)
    const ia = new Uint8Array(ab)
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i)
    }
    return new File([ab], fileName, { type: mimeType || 'image/png' })
  } catch {
    return null
  }
}
