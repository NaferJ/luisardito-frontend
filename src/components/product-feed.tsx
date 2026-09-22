"use client"

import { Fragment, useState } from "react"
import { DesignCard } from "@/components/design-card"
import { ProductDetailOverlay } from "@/components/product-detail-overlay"
import { LeaderboardAside } from "@/components/leaderboard-aside"
import { productToCard } from "@/lib/product-mapper"
import { useI18n } from "@/components/i18n/provider"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"
import type { LeaderboardEntry } from "@/lib/leaderboard"

type ProductFeedProps = {
  readonly products: Producto[]
  /** Top earners to display as a sidebar widget in the feed. */
  readonly leaderboard?: LeaderboardEntry[]
  /** When provided, the overlay starts open at this index (used by slug pages). */
  readonly initialOpenIndex?: number | null
  /**
   * Called when a feed card is clicked. Receives the product's slug (or ID).
   * If provided, the caller is responsible for URL navigation; the feed still
   * opens the overlay internally.
   */
  readonly onCardOpen?: (slug: string) => void
  /**
   * Called when the overlay closes. If provided, the caller is responsible for
   * navigation (e.g. pushing back to /shop). If omitted, the feed clears its
   * own state.
   */
  readonly onOverlayClose?: () => void
  /**
   * Called when the overlay navigates to a different product. Receives the new
   * index. If provided, the caller can update the URL; the feed still updates
   * its own state internally.
   */
  readonly onOverlayNavigate?: (nextIndex: number) => void
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
  const { dictionary } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex)
  // Adjust state during render when the prop changes (React-recommended
  // pattern, avoids setState-in-effect). This keeps the overlay in sync with
  // URL-driven navigation without cascading renders.
  const [prevInitial, setPrevInitial] = useState(initialOpenIndex)
  if (initialOpenIndex !== prevInitial) {
    setPrevInitial(initialOpenIndex)
    setOpenIndex(initialOpenIndex)
  }

  const cards = products.map((product, index) => productToCard(product, index, dictionary.card))

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

  return (
    <>
      {/* On wide desktop screens, the feed shifts right by 292px to uncover
          the static metadata sidebar. At constrained desktop widths the panel
          overlays the feed instead, preventing the page from reflowing. */}
      <div
        className={cn(
          "transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          openIndex !== null && "2xl:translate-x-[292px]",
        )}
      >
        <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
          {cards.map((card, i) => (
            <Fragment key={card.id}>
              <DesignCard
                card={card}
                onOpen={() => handleOpen(i)}
                eager={i < 4}
              />
              {i === 0 && <LeaderboardAside entries={leaderboard} />}
            </Fragment>
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
