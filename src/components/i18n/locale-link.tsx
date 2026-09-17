"use client"

import Link, { type LinkProps } from "next/link"
import { useLocale } from "./provider"
import { hasLocale } from "@/lib/i18n/locales"
import type { ReactNode } from "react"

type Props = Omit<LinkProps, "href"> & { href: string; children: ReactNode; className?: string }

export function localizeHref(href: string, locale: string): string {
  if (!href.startsWith("/") || href.startsWith("//") || href.startsWith("/shop/api/")) return href
  const parts = href.split("/")
  if (hasLocale(parts[1])) parts.splice(1, 1)
  return `/${locale}${parts.join("/") === "/" ? "" : parts.join("/")}`
}

export function LocaleLink({ href, children, ...props }: Props) {
  const locale = useLocale()
  return <Link href={localizeHref(href, locale)} {...props}>{children}</Link>
}
