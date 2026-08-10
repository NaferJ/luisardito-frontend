"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Bookmark, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { DesignCardData } from "@/components/design-card"
import { cn } from "@/lib/utils"

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
}: {
  cards: DesignCardData[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}) {
  const [saved, setSaved] = useState(false)
  const card = cards[index]

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

  useEffect(() => {
    setSaved(false)
  }, [card?.id])

  if (!card) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={card.title}
      className="fixed inset-0 z-50 flex flex-col bg-background/85 backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 px-4 pt-4 lg:pl-[252px]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => index > 0 && onNavigate(index - 1)}
          disabled={index === 0}
          aria-label="Previous design"
          className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => index < cards.length - 1 && onNavigate(index + 1)}
          disabled={index === cards.length - 1}
          aria-label="Next design"
          className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto px-4 pb-8 pt-6 lg:flex-row lg:items-start lg:gap-12 lg:pl-[252px]">
        <div className="flex w-full flex-col gap-6 lg:w-[300px] lg:shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                {card.category}
              </span>
              <h2 className="text-[17px] font-medium text-foreground text-balance">{card.title}</h2>
            </div>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              aria-pressed={saved}
              aria-label="Save design"
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
                saved ? "bg-gold text-gold-foreground" : "bg-secondary text-foreground hover:bg-accent",
              )}
            >
              <Bookmark className={cn("size-3.5", saved && "fill-current")} aria-hidden="true" />
            </button>
          </div>

          <span className="text-[13px] text-muted-foreground">{card.author}</span>

          <p className="text-[13px] leading-relaxed text-muted-foreground">{card.description}</p>

          <span className="font-mono text-[12px] text-muted-foreground">{card.timeAgo}</span>

          <dl className="flex flex-col gap-3 border-t border-border pt-4">
            {statRows(card).map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-muted-foreground">{row.label}</dt>
                <dd className="text-right font-mono text-[13px] text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border">
            <Image src={card.image || "/placeholder.svg"} alt={card.alt} fill className="object-cover" priority />
          </div>
        </div>
      </div>
    </div>
  )
}
