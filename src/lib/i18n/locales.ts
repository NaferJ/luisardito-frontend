export const locales = ['es', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

export function hasLocale(value: string | undefined): value is Locale {
  return value !== undefined && locales.includes(value as Locale)
}

export function localeFromAcceptLanguage(value: string | null | undefined): Locale {
  if (!value) return defaultLocale

  const preferences = value
    .split(',')
    .map((part, index) => {
      const [languagePart, ...parameters] = part.trim().toLowerCase().split(';')
      const quality = parameters.find((parameter) => parameter.trim().startsWith('q='))?.trim().slice(2)
      const weight = quality === undefined ? 1 : Number.parseFloat(quality)
      return { language: languagePart ?? '', weight: Number.isFinite(weight) ? weight : 0, index }
    })
    .filter(({ language, weight }) => language && weight > 0 && language !== '*')
    .sort((a, b) => b.weight - a.weight || a.index - b.index)

  for (const preference of preferences) {
    const language = preference.language.split('-')[0]
    if (hasLocale(language)) return language
  }

  return defaultLocale
}
