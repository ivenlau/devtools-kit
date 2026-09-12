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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-void/80 backdrop-blur-sm">
      <div className="panel-glow animate-fade-up flex flex-col items-center gap-4 px-12 py-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-neon-cyan bg-void-200 shadow-neon-cyan">
          <Upload className="h-7 w-7 text-neon-cyan" />
        </div>
        <p className="font-display text-xl font-semibold text-ink-primary">DROP FILE</p>
        <p className="font-mono text-xs text-ink-muted">release to auto-route to a tool</p>
      </div>
    </div>
  )
}
