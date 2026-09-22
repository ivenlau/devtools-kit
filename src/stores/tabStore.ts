import { create } from 'zustand'
import { tools } from '@/lib/constants/tools'

const STORAGE_KEY = 'devtools-kit:tool-tabs'
const VALID_PATHS = new Set(tools.map((t) => t.path))

export interface ToolTab {
  /** instance id — the same tool can be opened in multiple tabs */
  id: string
  path: string
}

interface PersistedTabs {
  tabs: ToolTab[]
  activeId: string | null
}

const newTabId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`

function loadPersisted(): PersistedTabs {
  if (typeof window === 'undefined') return { tabs: [], activeId: null }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { tabs: [], activeId: null }
    const parsed = JSON.parse(raw) as PersistedTabs
    let tabs = Array.isArray(parsed.tabs) ? parsed.tabs : []
    // migrate the pre-instance-era format (plain path strings)
    if (tabs.length && typeof (tabs[0] as unknown) === 'string') {
      tabs = (tabs as unknown as string[]).map((p) => ({ id: newTabId(), path: p }))
    }
    tabs = tabs.filter((t) => t && typeof t.id === 'string' && VALID_PATHS.has(t.path))
    const activeId = parsed.activeId && tabs.some((t) => t.id === parsed.activeId) ? parsed.activeId : tabs[0]?.id ?? null
    return { tabs, activeId }
  } catch {
    return { tabs: [], activeId: null }
  }
}

function persist(state: Pick<TabState, 'tabs' | 'activeId'>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs: state.tabs, activeId: state.activeId }))
  } catch {
    /* storage unavailable — tabs still work for the session */
  }
}

interface TabState {
  tabs: ToolTab[]
  activeId: string | null
  /** in-memory: set by a tab click so the route effect treats it as a switch,
   *  not as a fresh "open" (which would duplicate the tab) */
  switchIntent: { id: string; path: string } | null
  hydrated: boolean
  /** in-memory: first tool-route entry of this page load restores instead of duplicating */
  sessionStarted: boolean
  /** in-memory: set on popstate so back/forward does not open a new tab */
  popNavigated: boolean
  hydrate: () => void
  markSessionStarted: () => void
  markPop: () => void
  consumePop: () => boolean
  /** switch to an existing tab instance (marks the switch intent) */
  beginSwitch: (id: string) => void
  clearSwitchIntent: () => void
  /** open a NEW tab instance of a tool and activate it */
  createTab: (path: string) => void
  /** activate the most recently opened existing tab for a path; false if none */
  activateExisting: (path: string) => boolean
  /** remove a tab; returns the surviving tabs */
  closeTab: (id: string) => ToolTab[]
}

export const useTabStore = create<TabState>((set, get) => {
  const ensureHydrated = () => {
    const state = get()
    if (state.hydrated) return
    const { tabs, activeId } = loadPersisted()
    set({ tabs, activeId, hydrated: true })
  }

  return {
    tabs: [],
    activeId: null,
    switchIntent: null,
    hydrated: false,
    sessionStarted: false,
    popNavigated: false,

    hydrate: () => {
      if (get().hydrated) return
      const { tabs, activeId } = loadPersisted()
      set({ tabs, activeId, hydrated: true })
    },

    markSessionStarted: () => set({ sessionStarted: true }),
    markPop: () => set({ popNavigated: true }),
    consumePop: () => {
      const pop = get().popNavigated
      if (pop) set({ popNavigated: false })
      return pop
    },

    beginSwitch: (id) => {
      ensureHydrated()
      const tab = get().tabs.find((t) => t.id === id)
      if (!tab) return
      set({ activeId: id, switchIntent: { id, path: tab.path } })
      persist({ tabs: get().tabs, activeId: id })
    },

    clearSwitchIntent: () => set({ switchIntent: null }),

    createTab: (path) => {
      if (!VALID_PATHS.has(path)) return
      ensureHydrated()
      const tab: ToolTab = { id: newTabId(), path }
      const tabs = [...get().tabs, tab]
      set({ tabs, activeId: tab.id })
      persist({ tabs, activeId: tab.id })
    },

    activateExisting: (path) => {
      if (!VALID_PATHS.has(path)) return false
      ensureHydrated()
      const { tabs } = get()
      // most recently opened match wins
      const match = [...tabs].reverse().find((t) => t.path === path)
      if (!match) return false
      set({ activeId: match.id })
      persist({ tabs, activeId: match.id })
      return true
    },

    closeTab: (id) => {
      ensureHydrated()
      const tabs = get().tabs
      const idx = tabs.findIndex((t) => t.id === id)
      if (idx === -1) return tabs
      const next = tabs.filter((t) => t.id !== id)
      const activeId = get().activeId
      const nextActive = activeId === id ? (next[Math.min(idx, next.length - 1)]?.id ?? null) : activeId
      set({ tabs: next, activeId: nextActive })
      persist({ tabs: next, activeId: nextActive })
      return next
    },
  }
})
