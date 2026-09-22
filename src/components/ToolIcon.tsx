'use client'

import {
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor, WandSparkles,
} from 'lucide-react'

const ICON_MAP: Record<string, typeof Hash> = {
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor, WandSparkles,
}

/** Render a tool icon by its registry icon name (tools.ts `icon` field). */
export function ToolIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Hash
  return <Icon className={className} />
}
