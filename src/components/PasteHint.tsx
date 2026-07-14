'use client'

import { X } from 'lucide-react'
import type { DetectedTool } from '@/lib/detectTool'

interface PasteHintProps {
  candidates: DetectedTool[]
  onSelect: (tool: DetectedTool) => void
  onClose: () => void
}

export function PasteHint({ candidates, onSelect, onClose }: PasteHintProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/30 dark:bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-[90vw] max-w-sm border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            选择要打开的工具
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          已识别到粘贴内容，请选择要使用的工具：
        </p>
        <div className="flex flex-col gap-2">
          {candidates.map((tool) => (
            <button
              key={tool.path}
              onClick={() => onSelect(tool)}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
            >
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                {tool.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
