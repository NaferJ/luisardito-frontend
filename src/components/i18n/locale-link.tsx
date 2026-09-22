"use client"

import Link, { type LinkProps } from "next/link"
import { useLocale } from "./provider"
import { hasLocale } from "@/lib/i18n/locales"
import { siteUrl } from "@/lib/landing-data"
import type { ReactNode } from "react"

type Props = Omit<LinkProps, "href"> & { href: string; children: ReactNode; className?: string }

export function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/shop/api/")) return href
  const parts = href.split("/")
  if (hasLocale(parts[1])) parts.splice(1, 1)
  return `/${locale}${parts.join("/") === "/" ? "" : parts.join("/")}`
}

/** Landing pages (`/`, `/info`, `/changelog`) are unreachable on
 * shop.luisardito.com — the host rewrite maps every path into `/shop/*` —
 * so on that host they must be absolute apex-domain URLs. */
export function landingHref(href: string, locale: string, shopHost: boolean): string {
  const localized = localizeHref(href, locale)
  return shopHost ? `${siteUrl}${localized}` : localized
}

export function LocaleLink({ href, children, ...props }: Props) {
  const locale = useLocale()
  return <Link href={localizeHref(href, locale)} {...props}>{children}</Link>
}

export function LandingLink({ href, shopHost, children, ...props }: Props & { shopHost: boolean }) {
  const locale = useLocale()
  return <Link href={landingHref(href, locale, shopHost)} {...props}>{children}</Link>
}
