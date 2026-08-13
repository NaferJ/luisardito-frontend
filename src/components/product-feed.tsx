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

/**
 * Distributes items row-major across N columns (item 0 → col 0, item 1 → col 1,
 * ... item N → col 0, item N+1 → col 1...). This guarantees every column is
 * populated, unlike CSS multi-column which flows top-to-bottom and can leave
 * trailing columns empty when there are few items.
 *
 * The leaderboard widget is injected into the first column after the second
 * card, matching the reference feed pattern.
 */
function distributeColumns(
  cards: ReturnType<typeof productToCard>[],
  columnCount: number,
  leaderboard: LeaderboardEntry[],
  onOpen: (i: number) => void,
) {
  const columns: React.ReactNode[][] = Array.from({ length: columnCount }, () => [])
  cards.forEach((card, i) => {
    columns[i % columnCount].push(
      <DesignCard key={card.id} card={card} onOpen={() => onOpen(i)} />,
    )
    // Insert leaderboard into the first column after the second card.
    if (i === 1 && leaderboard.length > 0) {
      columns[0].push(
        <LeaderboardAside key="leaderboard-aside" entries={leaderboard} />,
      )
    }
  })
  return columns
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

  const handleOpen = (i: number) => {
    setOpenIndex(i)
    onCardOpen?.(productSlug(products[i]))
  }

  // Pre-compute column distributions for each responsive breakpoint.
  // The reference uses a flex row of columns with min-w-0 flex-1 children.
  const cols2 = distributeColumns(cards, 2, leaderboard, handleOpen)
  const cols3 = distributeColumns(cards, 3, leaderboard, handleOpen)
  const cols4 = distributeColumns(cards, 4, leaderboard, handleOpen)

  return (
    <>
      {/* When a product is open, the feed shifts right by 292px to uncover
          the static metadata sidebar. The sidebar itself never moves —
          this shift is what creates the "panel sliding in from the left"
          illusion, matching the reference. */}
      <div
        className={cn(
          "transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          openIndex !== null && "lg:translate-x-[292px]",
        )}
      >
        {/* 2 columns on mobile */}
        <div className="flex items-start gap-3 sm:hidden">
          {cols2.map((col, i) => (
            <div key={i} className="min-w-0 flex-1">
              {col}
            </div>
          ))}
        </div>
        {/* 3 columns on sm-md */}
        <div className="hidden flex items-start gap-3 sm:flex lg:hidden">
          {cols3.map((col, i) => (
            <div key={i} className="min-w-0 flex-1">
              {col}
            </div>
          ))}
        </div>
        {/* 4 columns on lg+ */}
        <div className="hidden flex items-start gap-3 lg:flex">
          {cols4.map((col, i) => (
            <div key={i} className="min-w-0 flex-1">
              {col}
            </div>
          ))}
        </div>
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
