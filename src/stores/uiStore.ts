import { create } from 'zustand'

interface UIState {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  recentTools: string[]
  addRecentTool: (toolId: string) => void
  favoriteTools: string[]
  toggleFavorite: (toolId: string) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'system',
  setTheme: (theme) => set({ theme }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  recentTools: [],
  addRecentTool: (toolId) =>
    set((state) => ({
      recentTools: [toolId, ...state.recentTools.filter((id) => id !== toolId)].slice(0, 10),
    })),

  favoriteTools: [],
  toggleFavorite: (toolId) =>
    set((state) => ({
      favoriteTools: state.favoriteTools.includes(toolId)
        ? state.favoriteTools.filter((id) => id !== toolId)
        : [...state.favoriteTools, toolId],
    })),
}))
