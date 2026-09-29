import { Dispatch, SetStateAction, useEffect, useState } from 'react'

const TAB_KEY_PREFIX = 'devtools-kit:tab:'

export function tabFieldKey(tabId: string, field: string) {
  return `${TAB_KEY_PREFIX}${tabId}:${field}`
}

/** Remove every persisted field key belonging to one tab instance (call on tab close). */
export function removeTabKeys(tabId: string) {
  if (typeof window === 'undefined') return
  const prefix = `${TAB_KEY_PREFIX}${tabId}:`
  const doomed: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(prefix)) doomed.push(k)
  }
  doomed.forEach((k) => localStorage.removeItem(k))
}

/** Drop field keys whose tab instance no longer exists in the restored tab list. */
export function sweepOrphanTabKeys(validIds: Set<string>) {
  if (typeof window === 'undefined') return
  const doomed: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (!k || !k.startsWith(TAB_KEY_PREFIX)) continue
    const rest = k.slice(TAB_KEY_PREFIX.length)
    const sep = rest.indexOf(':')
    if (sep === -1 || !validIds.has(rest.slice(0, sep))) doomed.push(k)
  }
  doomed.forEach((k) => localStorage.removeItem(k))
}

/**
 * Per-tab-instance persisted state: the same tool opened in several tabs keeps
 * independent drafts that survive browser restarts and reloads.
 *
 * Reads the stored value once on mount (falling back to `initial`, or to
 * `opts.initIfEmpty()` for values that must be generated on first use only),
 * then persists every change after hydration completes. Keys are scoped by
 * tabId, so they are removed with the tab (see removeTabKeys).
 */
export function useTabState<T>(
  tabId: string,
  field: string,
  initial: T,
  opts?: { initIfEmpty?: () => T; legacyRawKey?: string },
): [T, Dispatch<SetStateAction<T>>] {
  const key = tabFieldKey(tabId, field)
  const [value, setValue] = useState<T>(initial)
  const [hydrated, setHydrated] = useState(false)

  // tabId is constant for a mounted tab instance; opts is only read on mount
  useEffect(() => {
    let restored = false
    try {
      const raw = localStorage.getItem(key)
      if (raw != null) {
        setValue(JSON.parse(raw) as T)
        restored = true
      }
    } catch {
      /* corrupted entry — fall back to the initial value */
    }
    // one-shot migration from a pre-per-tab raw-string key (claimed by the
    // first tab instance that mounts, then removed)
    if (!restored && opts?.legacyRawKey) {
      try {
        const legacy = localStorage.getItem(opts.legacyRawKey)
        if (legacy != null) {
          setValue(legacy as unknown as T)
          localStorage.removeItem(opts.legacyRawKey)
          restored = true
        }
      } catch {
        /* storage unavailable — skip migration */
      }
    }
    if (!restored && opts?.initIfEmpty) {
      setValue(opts.initIfEmpty())
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  // writes stay gated until hydration so the initial value never clobbers storage
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable or full — state still works for the session */
    }
  }, [hydrated, key, value])

  return [value, setValue]
}
