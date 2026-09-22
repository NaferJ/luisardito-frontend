import type { ComponentType } from "react"
import type { Dictionary } from "@/lib/i18n/shared"
import { XLogo, MinecraftLogo } from "@/components/brand-icons"
import { xUrl, discordUrl } from "@/lib/landing-data"

/** The strings a dictionary section must provide to back a promo card. */
type PromoStrings = {
  title: string
  subtitle: string
  text: string
  ariaLabel: string
}

/** Any dictionary section shaped like PromoStrings is a valid promo —
 * adding a new card only takes a new entry here plus its dictionary keys. */
export type SidebarPromoDictKey = {
  [K in keyof Dictionary]: Dictionary[K] extends PromoStrings ? K : never
}[keyof Dictionary]

export type SidebarPromo = {
  href: string
  icon: ComponentType<{ className?: string }>
  dict: SidebarPromoDictKey
}

export const sidebarPromos: SidebarPromo[] = [
  { href: xUrl, icon: XLogo, dict: "maker" },
  { href: discordUrl, icon: MinecraftLogo, dict: "minecraft" },
]
