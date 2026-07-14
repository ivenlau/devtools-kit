'use client'

import { useState, useCallback, useEffect } from 'react'
import { Upload } from 'lucide-react'

interface DropZoneProps {
  onFileDrop: (file: File) => void
}

export function DropZone({ onFileDrop }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    let dragCounter = 0

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      dragCounter++
      if (e.dataTransfer?.types.includes('Files')) {
        setIsDragging(true)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      dragCounter--
      if (dragCounter <= 0) {
        dragCounter = 0
        setIsDragging(false)
      }
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      dragCounter = 0
      setIsDragging(false)

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        onFileDrop(files[0])
      }
    }

    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('drop', handleDrop)
    }
  }, [onFileDrop])

  if (!isDragging) return null

  return (
    <div className="fixed inset-0 z-[101] bg-blue-500/10 dark:bg-blue-400/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 border-2 border-dashed border-blue-400 dark:border-blue-500 flex flex-col items-center gap-4 animate-pulse">
        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
          <Upload className="h-10 w-10 text-blue-500" />
        </div>
        <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          释放文件以打开对应工具
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          支持 JSON、Markdown、SQL、图片、代码等文件
        </p>
      </div>
    </div>
  )
}
