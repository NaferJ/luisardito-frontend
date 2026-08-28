"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bookmark, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { DesignCardData } from "@/components/design-card"
import { cn } from "@/lib/utils"
import { extractDominantColors } from "@/lib/extract-color"
import { setOverlayColors } from "@/lib/overlay-color-store"

const statRows = (card: DesignCardData) => [
  { label: "Impressions", value: card.impressions },
  { label: "Outbound", value: String(card.outbound) },
  { label: "Source", value: card.source },
  { label: "Category", value: card.category },
  { label: "Style", value: card.style },
  { label: "Color", value: card.color },
  { label: "Interaction", value: card.interaction.join(" ") },
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
      {/* Static metadata sidebar — always opaque, never animated.
          Sits at z-20 so the lightbox (z-50) and its blur layer only paint
          to the right of it (the lightbox media is offset by 292px via a
          spacer). This matches the reference: the panel never moves and
          never goes transparent, so the feed can never show through it.
          The "slide-in" illusion is created by the feed shifting right,
          not by the panel itself moving. */}
      <aside
        aria-label={card.title}
        className="fixed inset-y-0 left-0 right-0 z-20 flex flex-col overflow-hidden bg-background lg:left-[max(252px,calc(50vw-588px))] lg:right-auto lg:w-[292px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => index > 0 && onNavigate(index - 1)}
              disabled={index === 0}
              aria-label="Previous design"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => index < cards.length - 1 && onNavigate(index + 1)}
              disabled={index === cards.length - 1}
              aria-label="Next design"
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
                  aria-label="Save design"
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
              {statRows(card).map((row, i) => (
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

      {/* Lightbox: covers the overlay area but the blur + media are offset
          right by a 292px spacer so they never paint behind the sidebar.
          The container is pointer-events-none so only the media card
          captures interactions. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={card.title}
        className="fixed inset-y-0 left-0 right-0 z-50 hidden flex-row overflow-hidden pointer-events-none lg:flex lg:left-[max(252px,calc(50vw-588px))] lg:right-[120px]"
      >
        {/* Spacer — reserves the sidebar area so blur/media don't paint there */}
        <div className="hidden lg:block lg:w-[292px] lg:shrink-0" />

        {/* Media + blur area. Blur lives on its own static layer so it always
            paints correctly; only the image content fades + scales in on top. */}
        <div className="relative flex min-w-0 flex-1 items-center justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-background/70 backdrop-blur-[8px]"
          />
          <div className="overlay-media relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-sm bg-card shadow-2xl ring-1 ring-border">
            <Image src={card.image || "/placeholder.svg"} alt={card.alt} fill className="object-cover" priority />
          </div>
        </div>
      </div>
    </>
  )
}
