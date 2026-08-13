"use client"

import { useState } from "react"
import { DesignCard } from "@/components/design-card"
import { ProductDetailOverlay } from "@/components/product-detail-overlay"
import { LeaderboardAside } from "@/components/leaderboard-aside"
import { productToCard } from "@/lib/product-mapper"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"
import type { LeaderboardEntry } from "@/lib/leaderboard"

type ProductFeedProps = {
  products: Producto[]
  /** Top earners to display as a sidebar widget in the feed. */
  leaderboard?: LeaderboardEntry[]
  /** When provided, the overlay starts open at this index (used by slug pages). */
  initialOpenIndex?: number | null
  /**
   * Called when a feed card is clicked. Receives the product's slug (or ID).
   * If provided, the caller is responsible for URL navigation; the feed still
   * opens the overlay internally.
   */
  onCardOpen?: (slug: string) => void
  /**
   * Called when the overlay closes. If provided, the caller is responsible for
   * navigation (e.g. pushing back to /shop). If omitted, the feed clears its
   * own state.
   */
  onOverlayClose?: () => void
  /**
   * Called when the overlay navigates to a different product. Receives the new
   * index. If provided, the caller can update the URL; the feed still updates
   * its own state internally.
   */
  onOverlayNavigate?: (nextIndex: number) => void
}

/** URL-safe identifier for a product: slug if available, otherwise ID. */
function productSlug(product: Producto): string {
  return product.slug || String(product.id)
}

export function ProductFeed({
  products,
  leaderboard = [],
  initialOpenIndex = null,
  onCardOpen,
  onOverlayClose,
  onOverlayNavigate,
}: ProductFeedProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex)
  // Adjust state during render when the prop changes (React-recommended
  // pattern, avoids setState-in-effect). This keeps the overlay in sync with
  // URL-driven navigation without cascading renders.
  const [prevInitial, setPrevInitial] = useState(initialOpenIndex)
  if (initialOpenIndex !== prevInitial) {
    setPrevInitial(initialOpenIndex)
    setOpenIndex(initialOpenIndex)
  }

  const cards = products.map((p, i) => productToCard(p, i))

  const handleClose = () => {
    if (onOverlayClose) {
      onOverlayClose()
    } else {
      setOpenIndex(null)
    }
  }

  const handleNavigate = (nextIndex: number) => {
    setOpenIndex(nextIndex)
    onOverlayNavigate?.(nextIndex)
  }

  return (
    <>
      {/* When a product is open, the feed shifts right by 292px to uncover
          the static metadata sidebar. The sidebar itself never moves —
          this shift is what creates the "panel sliding in from the left"
          illusion, matching the reference. */}
      <div
        className={cn(
          "columns-2 gap-4 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:columns-3 lg:columns-4 [&>*]:break-inside-avoid motion-reduce:transition-none",
          openIndex !== null && "lg:translate-x-[292px]",
        )}
      >
        {cards.map((card, i) => (
          <DesignCard
            key={card.id}
            card={card}
            onOpen={() => {
              setOpenIndex(i)
              onCardOpen?.(productSlug(products[i]))
            }}
          />
        )).flatMap((card, i) =>
          // Insert the leaderboard aside after the second card, matching the
          // reference feed pattern (see JobListingsPanel in design-feed).
          i === 1 && leaderboard.length > 0
            ? [card, <LeaderboardAside key="leaderboard-aside" entries={leaderboard} />]
            : [card],
        )}
      </div>

      {openIndex !== null && (
        <ProductDetailOverlay
          products={products}
          index={openIndex}
          onClose={handleClose}
          onNavigate={handleNavigate}
        />
      )}
    </>
  )
}
