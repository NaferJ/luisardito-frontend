"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bookmark, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { DesignCardData } from "@/components/design-card"
import { cn } from "@/lib/utils"
import { useI18n } from "@/components/i18n/provider"
import type { Dictionary } from "@/lib/i18n/shared"
import { extractDominantColors } from "@/lib/extract-color"
import { setOverlayColors } from "@/lib/overlay-color-store"

const statRows = (card: DesignCardData, t: Dictionary["card"]) => [
  { label: t.stats.impressions, value: card.impressions },
  { label: t.stats.outbound, value: String(card.outbound) },
  { label: t.stats.source, value: card.source },
  { label: t.stats.category, value: card.category },
  { label: t.stats.style, value: card.style },
  { label: t.stats.color, value: card.color },
  { label: t.stats.interaction, value: card.interaction.join(" ") },
]

export function DesignDetailOverlay({
  cards,
  index,
  onClose,
  onNavigate,
}: Readonly<{
  cards: DesignCardData[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.card
  const [saved, setSaved] = useState(false)
  const [savedCardId, setSavedCardId] = useState<string | undefined>(undefined)
  const card = cards[index]

  // Reset saved state when switching to a different card (render-time adjustment
  // avoids calling setState inside an effect — see React "you might not need an effect").
  if (card?.id !== savedCardId) {
    setSavedCardId(card?.id)
    setSaved(false)
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < cards.length - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [index, cards.length, onClose, onNavigate])

  // Drive the side shader's color from the dominant colors of the currently
  // open design image. Stale results from rapid arrow navigation are ignored
  // via the cancelled flag; the store is cleared once when the overlay
  // unmounts. SideDecor picks the candidate with the best contrast against
  // the current background, so a dark image won't produce an invisible dark
  // shader color.
  const imageSrc = card?.image || null
  useEffect(() => {
    if (!imageSrc) return
    let cancelled = false
    extractDominantColors(imageSrc).then((colors) => {
      if (!cancelled) setOverlayColors(colors.length > 0 ? colors : null)
    })
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  useEffect(() => {
    return () => setOverlayColors(null)
  }, [])

  if (!card) return null

  return (
    <>
      {/* Static metadata sidebar above the full overlay backdrop. The panel
          never moves or becomes transparent; the feed creates the slide-in
          illusion by shifting right. */}
      <aside
        aria-label={card.title}
        className="fixed inset-y-0 left-0 right-0 z-50 flex flex-col overflow-hidden bg-background xl:left-[max(252px,calc(50vw-588px))] xl:right-auto xl:w-[292px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button
            type="button"
            onClick={onClose}
            aria-label={t.close}
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => index > 0 && onNavigate(index - 1)}
              disabled={index === 0}
              aria-label={t.previousDesign}
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => index < cards.length - 1 && onNavigate(index + 1)}
              disabled={index === cards.length - 1}
              aria-label={t.nextDesign}
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="text-[13px] text-muted-foreground">{card.category}</span>
                  <h2 className="text-[15px] font-medium text-foreground">{card.title}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSaved((s) => !s)}
                  aria-pressed={saved}
                  aria-label={t.saveDesign}
                  className={cn(
                    "flex size-7 shrink-0 items-center justify-center rounded-full transition-colors",
                    saved ? "bg-gold text-gold-foreground" : "bg-secondary text-foreground hover:bg-accent",
                  )}
                >
                  <Bookmark className={cn("size-3.5", saved && "fill-current")} aria-hidden="true" />
                </button>
              </div>

              <span className="text-[13px] text-foreground">{card.author}</span>

              <p className="text-[13px] leading-relaxed text-pretty text-foreground">{card.description}</p>

              <span className="text-[13px] text-muted-foreground">{card.timeAgo}</span>
            </div>

            <div className="flex flex-col">
              {statRows(card, t).map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "flex items-start justify-between gap-3 py-1.5",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="shrink-0 text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-right text-[13px] text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <div
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        className="fixed inset-y-0 left-0 right-0 z-40 hidden flex-row overflow-hidden pointer-events-none xl:flex xl:left-[max(252px,calc(50vw-588px))]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-auto absolute inset-0 bg-background/70 backdrop-blur-[8px]"
        />
        <div className="relative z-10 hidden xl:block xl:w-[292px] xl:shrink-0" />
        <div className="relative z-10 flex min-w-0 flex-1 items-center justify-center">
          <div className="overlay-media relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-sm bg-card shadow-2xl ring-1 ring-border">
            <Image src={card.image || "/placeholder.svg"} alt={card.alt} fill className="object-cover" priority />
          </div>
        </div>
      </div>
    </>
  )
}
