import type { ReactNode } from "react"
import Image from "next/image"
import { ArrowUpRight, Bookmark, Star } from "lucide-react"
import { cn } from "@/lib/utils"

export type DesignCardData = {
  readonly id: string
  readonly image: string
  readonly alt: string
  /** Tailwind aspect-ratio class (fallback when no real dimensions). */
  readonly aspect: string
  /** Inline aspect-ratio style from real image dimensions. Takes precedence over `aspect`. */
  readonly aspectStyle?: { aspectRatio: string }
  readonly avatarColor: string
  readonly badge?: "star" | number
  readonly tag: string
  readonly title: string
  readonly author: string
  readonly description: string
  readonly timeAgo: string
  readonly impressions: string
  readonly outbound: number
  readonly source: string
  readonly category: string
  readonly style: string
  readonly color: string
  readonly interaction: string[]
  /** Last person who redeemed this product (shop cards only). */
  readonly lastRedeemer?: { name: string; avatar?: string } | null
  /** Author avatar image URL (landing cards, when available). */
  readonly avatar?: string
}

export function DesignCard({
  card,
  onOpen,
}: Readonly<{
  card: DesignCardData
  onOpen: () => void
}>) {
  let avatarElement: ReactNode
  if (card.lastRedeemer?.avatar) {
    avatarElement = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.lastRedeemer.avatar}
        alt={card.lastRedeemer.name}
        className="size-7 rounded-full object-cover ring-1 ring-background/80"
      />
    )
  } else if (card.avatar) {
    avatarElement = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.avatar}
        alt={card.author}
        className="size-7 rounded-full object-cover ring-1 ring-background/80"
      />
    )
  } else {
    avatarElement = (
      <span
        aria-hidden="true"
        className={cn(
          "block size-7 rounded-full ring-1 ring-background/80",
          card.avatarColor,
        )}
      />
    )
  }

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
          sizes="(min-width: 2560px) 11vw, (min-width: 1920px) 12vw, (min-width: 1536px) 16vw, (min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
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
          {avatarElement}
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
