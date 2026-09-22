'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useI18n } from '@/components/I18nProvider'
import { tools } from '@/lib/constants/tools'
import { useTabStore } from '@/stores/tabStore'
import { TOOL_VIEWS } from '@/components/workspace/registry'

const DEFAULT_TITLE = 'DevToolsKit - 开发工具箱'

/**
 * Keeps every opened tool instance mounted for the whole session. Tabs only
 * toggle visibility (display:none), so switching never loses in-tool state.
 * The tab list is persisted by tabStore and restored on the next visit.
 *
 * Route handling (all in one place):
 *  - tab click  → activeId already points at the route's tool, nothing to do
 *  - reload     → first entry of the session restores the matching tab
 *  - back/forward → restores the matching tab (no duplicates)
 *  - any other entry (cards, home, paste, …) → opens a NEW tab instance
 */
export function ToolWorkspace() {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, t } = useI18n()
  const tabs = useTabStore((s) => s.tabs)
  const activeId = useTabStore((s) => s.activeId)
  const hydrated = useTabStore((s) => s.hydrated)
  const hydrate = useTabStore((s) => s.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])


  // Static-export URLs carry a trailing slash — normalize before lookup.
  const cleanPath = pathname?.replace(/\/+$/, '') ?? ''
  const isToolRoute = !!TOOL_VIEWS[cleanPath]

  // Route-entry resolution
  useEffect(() => {
    if (!isToolRoute) return
    const st = useTabStore.getState()
    if (!st.hydrated) st.hydrate()

    // A tab click announces itself; it only switches, never duplicates.
    if (st.switchIntent) {
      const matches = st.switchIntent.path === cleanPath
      st.clearSwitchIntent()
      if (matches) {
        st.markSessionStarted()
        return
      }
    }

    // Restore: first entry of this page load, or browser back/forward
    const restore = st.consumePop() || !st.sessionStarted
    if (!(restore && st.activateExisting(cleanPath))) {
      st.createTab(cleanPath) // explicit open → always a new tab instance
    }
    st.markSessionStarted()
  }, [isToolRoute, cleanPath])

  // Browser back/forward must not open duplicate tabs
  useEffect(() => {
    const onPop = () => useTabStore.getState().markPop()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Safety net: a tool route whose active tab vanished (all tabs closed,
  // stale state) must never render an empty page — fall back to the index.
  // Reads the store directly: on first entry the route effect above creates
  // the tab synchronously, so a render-time snapshot would be stale.
  useEffect(() => {
    if (!hydrated || !isToolRoute) return
    const st = useTabStore.getState()
    if (st.tabs.some((tl) => tl.id === st.activeId)) return
    router.replace('/tools/')
  }, [hydrated, isToolRoute, pathname, tabs, activeId, router])

  // Reflect the visible tool in the document title
  useEffect(() => {
    if (!isToolRoute) {
      document.title = DEFAULT_TITLE
      return
    }
    const activeTab = tabs.find((tl) => tl.id === activeId)
    const tool = tools.find((tl) => tl.path === (activeTab?.path ?? cleanPath))
    if (tool) document.title = `${lang === 'en' ? tool.nameEn : tool.name} · DevToolsKit`
  }, [isToolRoute, activeId, tabs, cleanPath, lang, t])

  const activeTab = tabs.find((tl) => tl.id === activeId)
  const visiblePath = isToolRoute ? (activeTab?.path ?? cleanPath) : null

  return (
    <div className={isToolRoute ? 'block' : 'hidden'} data-visible-path={visiblePath ?? ''} aria-hidden={!isToolRoute}>
      {tabs.map((tab) => {
        const View = TOOL_VIEWS[tab.path]
        if (!View) return null
        const visible = tab.id === activeId
        return (
          <div key={tab.id} style={{ display: visible ? 'block' : 'none' }}>
            <View />
          </div>
        )
      })}
    </div>
  )
}
