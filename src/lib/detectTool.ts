import { isLikelyTimestampInput, parseDateInput } from '@/lib/timestamp'

export interface DetectedTool {
  path: string
  name: string
  confidence: 'high' | 'medium' | 'low'
}

const FILE_EXTENSION_MAP: Record<string, DetectedTool> = {
  '.md':       { path: '/tools/markdown',      name: 'Markdown 编辑器',  confidence: 'high' },
  '.markdown': { path: '/tools/markdown',      name: 'Markdown 编辑器',  confidence: 'high' },
  '.txt':      { path: '/tools/markdown',      name: 'Markdown 编辑器',  confidence: 'medium' },
  '.json':     { path: '/tools/json',          name: 'JSON 格式化',     confidence: 'high' },
  '.sql':      { path: '/tools/sql',           name: 'SQL 格式化',      confidence: 'high' },
  '.js':       { path: '/tools/minify',        name: '代码压缩',        confidence: 'high' },
  '.mjs':      { path: '/tools/minify',        name: '代码压缩',        confidence: 'high' },
  '.css':      { path: '/tools/minify',        name: '代码压缩',        confidence: 'high' },
  '.html':     { path: '/tools/minify',        name: '代码压缩',        confidence: 'high' },
  '.htm':      { path: '/tools/minify',        name: '代码压缩',        confidence: 'high' },
  '.yaml':     { path: '/tools/convert',       name: '数据格式转换',    confidence: 'high' },
  '.yml':      { path: '/tools/convert',       name: '数据格式转换',    confidence: 'high' },
  '.xml':      { path: '/tools/convert',       name: '数据格式转换',    confidence: 'high' },
  '.toml':     { path: '/tools/convert',       name: '数据格式转换',    confidence: 'high' },
  '.jpg':      { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
  '.jpeg':     { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
  '.png':      { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
  '.webp':     { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
  '.gif':      { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
  '.svg':      { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
  '.bmp':      { path: '/tools/image-compress', name: '图片压缩',       confidence: 'high' },
}

const IMAGE_MIME_PREFIX = 'image/'

/**
 * Detect tool by file extension or MIME type.
 */
export function detectByFile(fileName: string, mimeType?: string): DetectedTool | null {
  const ext = fileName.includes('.') ? '.' + fileName.split('.').pop()!.toLowerCase() : ''
  if (ext && FILE_EXTENSION_MAP[ext]) {
    return FILE_EXTENSION_MAP[ext]
  }
  if (mimeType?.startsWith(IMAGE_MIME_PREFIX)) {
    return { path: '/tools/image-compress', name: '图片压缩', confidence: 'high' }
  }
  return null
}

/**
 * Detect tool by pasted text content.
 * Returns the best match, or multiple candidates when ambiguous.
 */
export function detectByContent(text: string): DetectedTool | DetectedTool[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  // Timestamp or date — go straight to the timestamp converter.
  if (isLikelyTimestampInput(trimmed) || parseDateInput(trimmed)) {
    return { path: '/tools/timestamp', name: '时间戳转换', confidence: 'high' }
  }

  // 1. JWT — three base64url segments separated by dots
  if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(trimmed)) {
    return { path: '/tools/jwt', name: 'JWT 解码器', confidence: 'high' }
  }

  // 2. Color value — HEX, rgb(), hsl()
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(trimmed) ||
      /^rgba?\(\s*\d/.test(trimmed) ||
      /^hsla?\(\s*\d/.test(trimmed)) {
    return { path: '/tools/color', name: '颜色转换器', confidence: 'high' }
  }

  // 3. IP address — IPv4
  const ipMatch = trimmed.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipMatch) {
    const valid = ipMatch.slice(1).every(n => parseInt(n) <= 255)
    if (valid) {
      return { path: '/tools/ip', name: 'IP 地址查询', confidence: 'high' }
    }
  }

  // 4. SQL keywords
  if (/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|WITH|EXPLAIN)\s/i.test(trimmed)) {
    return { path: '/tools/sql', name: 'SQL 格式化', confidence: 'high' }
  }

  // 5. Cron expression — 5 or 6 fields
  if (/^(\S+\s+){4,5}\S+$/.test(trimmed) &&
      !trimmed.includes('\n') &&
      /^[*0-9\/,\-]+\s/.test(trimmed)) {
    return { path: '/tools/cron', name: 'Cron 表达式生成', confidence: 'medium' }
  }

  // 6. URL
  if (/^https?:\/\/[^\s]+$/.test(trimmed) && !trimmed.includes('\n')) {
    return { path: '/tools/url', name: 'URL 编解码', confidence: 'high' }
  }

  // 7. JSON
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return { path: '/tools/json', name: 'JSON 格式化', confidence: 'high' }
    } catch {
      // not valid JSON, fall through
    }
  }

  // 8. Ambiguous — offer candidates (Markdown first per user preference)
  return [
    { path: '/tools/markdown', name: 'Markdown 编辑器', confidence: 'low' },
    { path: '/tools/json',     name: 'JSON 格式化',    confidence: 'low' },
    { path: '/tools/diff',     name: 'Diff 文本对比',  confidence: 'low' },
    { path: '/tools/base64',   name: 'Base64 编解码',  confidence: 'low' },
    { path: '/tools/minify',   name: '代码压缩',       confidence: 'low' },
  ]
}
