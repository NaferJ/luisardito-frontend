"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Globe2 } from "lucide-react"
import { useI18n } from "./provider"
import { hasLocale, type Locale } from "@/lib/i18n/locales"

export function LocaleSwitcher() {
  const { dictionary, locale } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextLocale: Locale = locale === "es" ? "en" : "es"
  const tooltipLabel = dictionary.language[nextLocale] ?? nextLocale.toUpperCase()

  function switchLocale() {
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
    const segments = pathname.split("/")
    if (hasLocale(segments[1])) segments[1] = nextLocale
    else segments.splice(1, 0, nextLocale)
    const query = searchParams.toString()
    router.push(`${segments.join("/") || `/${nextLocale}`}${query ? `?${query}` : ""}`)
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={tooltipLabel}
      className="group relative flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-[background-color,color,transform] duration-200 hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground active:scale-90"
    >
      <Globe2 className="locale-globe-icon size-4" aria-hidden="true" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-sm border border-gold/30 bg-popover px-2.5 py-1.5 text-[11px] font-medium text-popover-foreground opacity-0 shadow-lg transition-[opacity,transform] duration-150 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        {tooltipLabel}
      </span>
    </button>
  )
}
