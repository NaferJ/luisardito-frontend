import 'server-only'

import { lang } from 'next/root-params'
import { notFound } from 'next/navigation'
import { hasLocale, localeFromAcceptLanguage } from './locales'
import type { Locale } from './locales'
import type { Dictionary } from './shared'
import en from './dictionaries/en.json'
import es from './dictionaries/es.json'

export { defaultLocale, hasLocale, locales } from './locales'
export type { Locale } from './locales'

export const dictionaries: Record<Locale, Dictionary> = { en, es }

export async function getDictionary(): Promise<Dictionary> {
  const locale = await lang()
  if (!hasLocale(locale)) notFound()
  return dictionaries[locale]
}

export { getRequestLocale } from './request-locale'
export { localeFromAcceptLanguage }
