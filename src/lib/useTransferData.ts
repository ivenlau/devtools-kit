'use client'

import { useEffect } from 'react'
import { useTransferStore } from '@/stores/transferStore'

/**
 * Hook to consume pending data from the transfer store.
 * Reads store directly on mount to avoid Zustand subscription timing issues
 * during page navigation.
 */
export function useTransferData(setData: (content: string) => void) {
  useEffect(() => {
    const { pendingData, clearPendingData } = useTransferStore.getState()
    if (pendingData?.content) {
      setData(pendingData.content)
      clearPendingData()
    }
  }, [setData])
}

/**
 * Hook for tools that accept file data (e.g. image-compress).
 * Provides the raw pending data object for custom handling.
 */
export function useTransferFile() {
  const pendingData = useTransferStore((s) => s.pendingData)
  const clearPendingData = useTransferStore((s) => s.clearPendingData)

  return { pendingData, clearPendingData }
}
