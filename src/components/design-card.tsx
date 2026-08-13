import Image from "next/image"
import { ArrowUpRight, Bookmark, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type DesignCardData = {
  id: string
  image: string
  alt: string
  /** Tailwind aspect-ratio class (fallback when no real dimensions). */
  aspect: string
  /** Inline aspect-ratio style from real image dimensions. Takes precedence over `aspect`. */
  aspectStyle?: { aspectRatio: string }
  avatarColor: string
  badge?: "star" | number
  tag: string
  title: string
  author: string
  description: string
  timeAgo: string
  impressions: string
  outbound: number
  source: string
  category: string
  style: string
  color: string
  interaction: string[]
  /** Last person who redeemed this product (shop cards only). */
  lastRedeemer?: { name: string; avatar?: string } | null
  /** Author avatar image URL (landing cards, when available). */
  avatar?: string
}

export function DesignCard({
  card,
  onOpen,
}: {
  card: DesignCardData
  onOpen: () => void
}) {
  return (
    <article className="mb-3 break-inside-avoid">
      <div
        className={cn(
          "group relative overflow-hidden rounded-sm bg-secondary",
          // Only apply the Tailwind aspect class when there's no inline style.
          card.aspectStyle ? undefined : card.aspect,
        )}
        style={card.aspectStyle}
      >
        <Image
          src={card.image || "/placeholder.svg"}
          alt={card.alt}
          fill
          className="object-cover"
        />

        {/* Main click target — absolute overlay so sibling buttons don't nest */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${card.title}`}
          className="absolute inset-0 z-[1] cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />

        {/* Star badge (discount / staff pick) — top-left, always visible */}
        {card.badge === "star" && (
          <span className="absolute top-2.5 left-2.5 z-30 flex size-6 items-center justify-center rounded-full bg-gold-core text-background">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
          </span>
        )}

        {/* Number badge (slide count) — top-right, always visible.
            The bookmark button (below) covers it on hover. */}
        {typeof card.badge === "number" && (
          <span className="absolute top-2.5 right-2.5 z-20 flex size-6 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background">
            {card.badge}
          </span>
        )}

        {/* Bookmark button — top-right, hover/focus only */}
        <button
          type="button"
          aria-label="Save"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-2.5 right-2.5 z-30 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          <Bookmark className="size-3.5" aria-hidden="true" />
        </button>

        {/* Avatar — bottom-left, always visible.
            Shows last redeemer (shop) or author (landing) avatar. */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          {card.lastRedeemer?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.lastRedeemer.avatar}
              alt={card.lastRedeemer.name}
              className="size-7 rounded-full object-cover ring-1 ring-background/80"
            />
          ) : card.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.avatar}
              alt={card.author}
              className="size-7 rounded-full object-cover ring-1 ring-background/80"
            />
          ) : (
            <span
              aria-hidden="true"
              className={cn(
                "block size-7 rounded-full ring-1 ring-background/80",
                card.avatarColor,
              )}
            />
          )}
        </div>

        {/* Open arrow — bottom-right, always visible */}
        <span className="absolute bottom-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm">
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </span>

        {/* Subtle border overlay — always visible */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-sm border border-border/70"
        />
      </div>
    </article>
  )
}
