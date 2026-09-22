"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { useI18n } from "@/components/i18n/provider"
import { sidebarPromos } from "@/lib/sidebar-promos"
import { cn } from "@/lib/utils"

const PROMO_ROTATE_MS = 8000

export type PromoItem = {
  href: string
  icon: ReactNode
  title: string
  subtitle: string
  text: string
  ariaLabel: string
}

/** Sponsor-style card linking out to a community destination — the
 * developer's X profile, the community Discord, etc. Styled after
 * recent.design's "featured sponsor" card (logo, title + subtitle row,
 * tagline below), minus the background surface. */
export function PromoCard({ href, icon, title, subtitle, text, ariaLabel }: Readonly<PromoItem>) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="block transition-opacity hover:opacity-80"
    >
      <div className="flex items-center gap-2.5">
        <span className="shrink-0 text-foreground">{icon}</span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-[13px] font-medium leading-none text-foreground">{title}</span>
          <span className="text-[12px] leading-none text-muted-foreground">{subtitle}</span>
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{text}</p>
    </a>
  )
}

/** Rotates promo cards through a single slot, like recent.design's
 * "featured sponsor" — the cards are stacked in one grid cell (height =
 * tallest card, so no layout jump) and crossfade via opacity/blur/
 * translate transitions, while a thin bar tracks the interval. Hovering
 * or keyboard-focusing the slot pauses the rotation and the bar mid-fill
 * so the current card stays readable. Auto-rotation (and the bar) is
 * skipped for prefers-reduced-motion, and a single card renders
 * statically. */
export function PromoCarousel({ promos }: Readonly<{ promos: PromoItem[] }>) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const remainingRef = useRef(PROMO_ROTATE_MS)
  const deadlineRef = useRef(0)

  useEffect(() => {
    if (promos.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    if (paused) {
      // Freeze the countdown where it is; the CSS bar pauses via the
      // `.paused` class at the same moment, so they stay in sync.
      remainingRef.current = Math.max(0, deadlineRef.current - Date.now())
      return
    }
    deadlineRef.current = Date.now() + remainingRef.current
    const id = setTimeout(() => {
      remainingRef.current = PROMO_ROTATE_MS
      setIndex((i) => (i + 1) % promos.length)
    }, remainingRef.current)
    return () => clearTimeout(id)
  }, [index, paused, promos.length])

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="grid">
        {promos.map((promo, i) => (
          <div
            key={promo.href}
            inert={i !== index}
            className={cn(
              "col-start-1 row-start-1 transition-[opacity,transform,filter] duration-500 ease-out motion-reduce:transition-none",
              i !== index && "pointer-events-none translate-y-1 opacity-0 blur-[4px]",
            )}
          >
            <PromoCard {...promo} />
          </div>
        ))}
      </div>
      {promos.length > 1 && (
        <div aria-hidden="true" className="promo-progress-track mt-1.5 h-0.5 overflow-hidden rounded-full bg-border/60">
          {/* key={index} remounts the bar so the fill animation restarts. */}
          <span
            key={index}
            className={cn("promo-progress block h-full w-full bg-muted-foreground/50", paused && "paused")}
            style={{ "--promo-duration": `${PROMO_ROTATE_MS}ms` } as CSSProperties}
          />
        </div>
      )}
    </div>
  )
}

/** The sidebar's promo slot. Cards are declared in
 * `src/lib/sidebar-promos.ts` (href + icon + dictionary key); adding or
 * changing one never touches this file or the sidebar itself. */
export function SidebarPromoCards() {
  const { dictionary } = useI18n()
  const promos = sidebarPromos.map((promo) => ({
    href: promo.href,
    icon: <promo.icon className="size-7" />,
    ...dictionary[promo.dict],
  }))
  return <PromoCarousel promos={promos} />
}
