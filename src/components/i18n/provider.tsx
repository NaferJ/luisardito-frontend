"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import type { Locale } from "@/lib/i18n/locales"
import type { Dictionary } from "@/lib/i18n/shared"

type I18nContextValue = { locale: Locale; dictionary: Dictionary }
const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ locale, dictionary, children }: I18nContextValue & { children: ReactNode }) {
  const value = useMemo(() => ({ locale, dictionary }), [locale, dictionary])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) throw new Error("useI18n must be used within I18nProvider")
  return context
}

export const useLocale = () => useI18n().locale
