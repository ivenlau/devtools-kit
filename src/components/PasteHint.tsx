'use client'

import { X } from 'lucide-react'
import type { DetectedTool } from '@/lib/detectTool'
import { useI18n } from '@/components/I18nProvider'

interface PasteHintProps {
  candidates: DetectedTool[]
  onSelect: (tool: DetectedTool) => void
  onClose: () => void
}

export function PasteHint({ candidates, onSelect, onClose }: PasteHintProps) {
  const { t, lang } = useI18n()

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="panel-glow animate-fade-up p-6 w-[90vw] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono text-xs tracking-[0.16em] text-neon-cyan">
            ROUTE PASTE
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-void-200 transition-colors"
          >
            <X className="h-4 w-4 text-ink-muted" />
          </button>
        </div>
        <p className="text-sm text-ink-secondary mb-4">
          {t('检测到多种可能，请选择目标工具：')}
        </p>
        <div className="flex flex-col gap-2">
          {candidates.map((tool) => (
            <button
              key={tool.path}
              onClick={() => onSelect(tool)}
              className="w-full text-left px-4 py-3 rounded-lg border border-border-dim bg-void-200 hover:border-neon-cyan hover:bg-void-300 transition-all group"
            >
              <span className="text-sm font-medium text-ink-primary group-hover:text-neon-cyan">
                {t(tool.name)}
              </span>
              <span className="mt-0.5 block font-mono text-[11px] text-ink-muted">
                {tool.path}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
