'use client'

import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'

function ToolViewSkeleton() {
  return (
    <div className="flex min-h-[calc(100dvh-var(--header-total))] w-full flex-col items-center justify-center gap-4 bg-void">
      <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-neon-cyan border-t-transparent" />
      <p className="font-mono text-xs tracking-wider text-ink-muted">LOADING…</p>
    </div>
  )
}

const lazyTool = (loader: () => Promise<{ default: ComponentType }>): ComponentType =>
  dynamic(loader, { ssr: false, loading: ToolViewSkeleton })

/**
 * Tool path → mounted view. Every entry is a lazy chunk: a tool's code only
 * loads the first time its tab opens, then stays alive for the session.
 */
export const TOOL_VIEWS: Record<string, ComponentType> = {
  '/tools/json': lazyTool(() => import('@/components/tools/JsonTool')),
  '/tools/base64': lazyTool(() => import('@/components/tools/Base64Tool')),
  '/tools/timestamp': lazyTool(() => import('@/components/tools/TimestampTool')),
  '/tools/regex': lazyTool(() => import('@/components/tools/RegexTool')),
  '/tools/uuid': lazyTool(() => import('@/components/tools/HashUuidTool')),
  '/tools/url': lazyTool(() => import('@/components/tools/UrlTool')),
  '/tools/markdown': lazyTool(() => import('@/components/tools/MarkdownTool')),
  '/tools/color': lazyTool(() => import('@/components/tools/ColorTool')),
  '/tools/binary': lazyTool(() => import('@/components/tools/BinaryTool')),
  '/tools/qrcode': lazyTool(() => import('@/components/tools/QrDesignTool')),
  '/tools/diff': lazyTool(() => import('@/components/tools/DiffTool')),
  '/tools/curl': lazyTool(() => import('@/components/tools/CurlTool')),
  '/tools/ip': lazyTool(() => import('@/components/tools/IpTool')),
  '/tools/jwt': lazyTool(() => import('@/components/tools/JwtTool')),
  '/tools/sql': lazyTool(() => import('@/components/tools/SqlTool')),
  '/tools/convert': lazyTool(() => import('@/components/tools/DataConvertTool')),
  '/tools/image-studio': lazyTool(() => import('@/components/tools/ImageStudioTool')),
  '/tools/minify': lazyTool(() => import('@/components/tools/MinifyTool')),
  '/tools/html-entity': lazyTool(() => import('@/components/tools/HtmlEntityTool')),
  '/tools/useragent': lazyTool(() => import('@/components/tools/UserAgentTool')),
  '/tools/cron': lazyTool(() => import('@/components/tools/CronTool')),
}
