'use client'

import { useEffect } from 'react'
import { create } from 'zustand'
import { AlertTriangle, Info } from 'lucide-react'
import { useI18n } from '@/components/I18nProvider'

export interface DialogOptions {
  /** title in the modal head; defaults to a tone-based label */
  title?: string
  /** visual tone — picks the icon color (default 'info') */
  tone?: 'info' | 'warning' | 'danger'
  /** show a cancel button; the promise then resolves false on dismiss */
  confirm?: boolean
}

interface DialogState {
  open: boolean
  message: string
  options: DialogOptions
  resolve: ((ok: boolean) => void) | null
  show: (message: string, options?: DialogOptions) => Promise<boolean>
  close: (ok: boolean) => void
}

const useDialogStore = create<DialogState>((set, get) => ({
  open: false,
  message: '',
  options: {},
  resolve: null,
  show: (message, options = {}) =>
    new Promise<boolean>((resolve) => {
      // a new dialog replaces one that is still open
      get().resolve?.(false)
      set({ open: true, message, options, resolve })
    }),
  close: (ok) => {
    get().resolve?.(ok)
    set({ open: false, resolve: null })
  },
}))

/** 模态消息弹窗 —— 替代 window.alert / window.confirm，UI 与站点风格一致 */
export function showDialog(message: string, options?: DialogOptions): Promise<boolean> {
  return useDialogStore.getState().show(message, options)
}

const TONES = {
  info: { icon: Info, text: 'text-neon-cyan', border: 'border-neon-cyan' },
  warning: { icon: AlertTriangle, text: 'text-neon-amber', border: 'border-neon-amber' },
  danger: { icon: AlertTriangle, text: 'text-neon-magenta', border: 'border-neon-magenta' },
} as const

/** 全局弹窗宿主 —— 挂在根布局，配合 showDialog 使用 */
export function DialogHost() {
  const open = useDialogStore((s) => s.open)
  const message = useDialogStore((s) => s.message)
  const options = useDialogStore((s) => s.options)
  const close = useDialogStore((s) => s.close)
  const { t } = useI18n()

  // Esc 关闭 = 取消
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open) return null
  const tone = TONES[options.tone ?? 'info']
  const Icon = tone.icon

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-void/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={() => close(false)}
    >
      <div
        className="panel-glow animate-fade-up mx-4 w-[min(92vw,420px)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tool-panel-head">
          <span className={tone.text}>&gt;_</span>
          <span>{options.title ?? (options.confirm ? t('请确认') : t('提示'))}</span>
        </div>
        <div className="flex items-start gap-3 px-5 py-5">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-void-200 ${tone.border} ${tone.text}`}>
            <Icon className="h-4 w-4" />
          </span>
          <p className="pt-1.5 font-mono text-sm leading-relaxed text-ink-primary">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border-dim bg-void-100 px-5 py-3">
          {options.confirm && (
            <button onClick={() => close(false)} className="tool-btn">
              {t('取消')}
            </button>
          )}
          <button onClick={() => close(true)} className="tool-btn tool-btn-accent">
            {t('确定')}
          </button>
        </div>
      </div>
    </div>
  )
}
