import { create } from 'zustand'

interface TransferData {
  content: string
  fileName?: string
  mimeType?: string
}

interface TransferState {
  pendingData: TransferData | null
  setPendingData: (data: TransferData) => void
  clearPendingData: () => void
}

export const useTransferStore = create<TransferState>((set) => ({
  pendingData: null,
  setPendingData: (data) => set({ pendingData: data }),
  clearPendingData: () => set({ pendingData: null }),
}))
