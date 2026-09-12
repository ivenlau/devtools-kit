'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { enDict } from '@/lib/i18n/en'

export type Lang = 'zh' | 'en'

interface I18nContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  /** Translate a zh source string; passthrough when untranslated or lang is zh. */
  t: (s: string) => string
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'zh',
  setLang: () => {},
  t: (s) => s,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('zh')

  useEffect(() => {
    setLangState(localStorage.getItem('lang') === 'en' ? 'en' : 'zh')
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('lang', l)
    document.documentElement.lang = l === 'en' ? 'en' : 'zh-CN'
  }

  const t = (s: string) => (lang === 'en' ? enDict[s] ?? s : s)

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  return useContext(I18nContext)
}
