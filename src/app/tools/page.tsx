import Link from 'next/link'
import {
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor
} from 'lucide-react'
import { tools } from '@/lib/constants/tools'

const iconMap: Record<string, any> = {
  Braces, FileCode, Clock, Regex, Hash, Link2, FileText, Palette,
  QrCode, ArrowLeftRight, Terminal, Globe, Shield, Database, RefreshCw,
  Image, Minimize2, Code2, Monitor,
}

const accents = ['#00E5FF', '#B8FF3C', '#A855F7', '#FFB020', '#FF2D95', '#FF79C6']

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-void">
      <div className="border-b border-border-dim bg-void-100">
        <div className="w-full px-4 py-8 sm:px-6 lg:px-8">
          <p className="font-mono text-[11px] tracking-[0.16em] text-neon-cyan">// ALL MODULES</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-ink-primary">TOOLS</h1>
          <p className="mt-1 text-sm text-ink-secondary">
            20+ 实用工具 · 本地运行 · 零安装
          </p>
        </div>
      </div>

      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tools.map((tool, i) => {
            const Icon = iconMap[tool.icon] || Hash
            const accent = accents[i % accents.length]
            return (
              <Link
                key={tool.id}
                href={tool.path}
                className="tool-card animate-fade-up"
                style={{ '--accent': accent, animationDelay: `${i * 30}ms` } as React.CSSProperties}
              >
                <div className="relative z-10">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md border bg-void-200"
                    style={{
                      borderColor: accent,
                      color: accent,
                      boxShadow: `0 0 12px ${accent}33`,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-ink-primary">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-[11px] leading-snug text-ink-secondary">
                    {tool.description}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink-muted">{tool.path}</span>
                    <span className="font-mono text-[10px] tracking-wider" style={{ color: accent }}>
                      OPEN →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </div>
  )
}
