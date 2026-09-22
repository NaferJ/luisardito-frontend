"use client"

import { useState, useSyncExternalStore } from "react"
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

const DESKTOP_FEED_QUERY = "(min-width: 1024px)"
const TABLET_FEED_QUERY = "(min-width: 640px)"

function subscribeFeedColumns(callback: () => void): () => void {
  const queries = [DESKTOP_FEED_QUERY, TABLET_FEED_QUERY].map((query) => window.matchMedia(query))
  queries.forEach((query) => query.addEventListener("change", callback))
  return () => queries.forEach((query) => query.removeEventListener("change", callback))
}

function getFeedColumnCount(): number {
  if (window.matchMedia(DESKTOP_FEED_QUERY).matches) return 4
  return window.matchMedia(TABLET_FEED_QUERY).matches ? 3 : 2
}

function useFeedColumnCount(): number {
  return useSyncExternalStore(subscribeFeedColumns, getFeedColumnCount, () => 2)
}

/**
 * Distributes cards into the currently shortest column using their image
 * aspect ratios, matching the height-balanced masonry strategy used by the
 * reference feed while preserving each column's independent vertical flow.
 *
 * The leaderboard widget is injected into the first column after its first
 * card, matching the reference feed pattern.
 */
function distributeColumns(
  cards: ReturnType<typeof productToCard>[],
  columnCount: number,
  leaderboard: LeaderboardEntry[],
  onOpen: (i: number) => void,
  onAspectRatio: (id: string, ratio: number) => void,
) {
  const columns: React.ReactNode[][] = Array.from({ length: columnCount }, () => [])
  const heights = Array.from({ length: columnCount }, () => 0)

  cards.forEach((card, i) => {
    const columnIndex = heights.indexOf(Math.min(...heights))
    const dimensions = card.aspectStyle?.aspectRatio.split("/").map(Number)
    const aspectRatio = dimensions?.length === 2 && dimensions[0] > 0 && dimensions[1] > 0
      ? dimensions[0] / dimensions[1]
      : 1

    columns[columnIndex].push(
      <DesignCard
        key={card.id}
        card={card}
        onOpen={() => onOpen(i)}
        onAspectRatio={(ratio) => onAspectRatio(card.id, ratio)}
        eager={i < columnCount * 2}
      />,
    )
    heights[columnIndex] += 1 / aspectRatio
  })

  if (leaderboard.length > 0) {
    columns[0].splice(
      Math.min(1, columns[0].length),
      0,
      <LeaderboardAside key="leaderboard-aside" entries={leaderboard} />,
    )
  }

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
  const { dictionary } = useI18n()
  const [openIndex, setOpenIndex] = useState<number | null>(initialOpenIndex)
  const [imageAspects, setImageAspects] = useState<Record<string, number>>({})
  // Adjust state during render when the prop changes (React-recommended
  // pattern, avoids setState-in-effect). This keeps the overlay in sync with
  // URL-driven navigation without cascading renders.
  const [prevInitial, setPrevInitial] = useState(initialOpenIndex)
  if (initialOpenIndex !== prevInitial) {
    setPrevInitial(initialOpenIndex)
    setOpenIndex(initialOpenIndex)
  }

  const cards = products.map((product, index) => {
    const card = productToCard(product, index, dictionary.card)
    const measuredAspect = imageAspects[card.id]
    return measuredAspect
      ? { ...card, aspectStyle: { aspectRatio: String(measuredAspect) }, useNaturalAspect: false }
      : card
  })

  const handleAspectRatio = (id: string, ratio: number) => {
    setImageAspects((current) => current[id] === ratio ? current : { ...current, [id]: ratio })
  }

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

  // Render only the active masonry variant. Mounting separate 2/3/4-column
  // trees would triple every product card and image even when CSS hid two of them.
  const columnCount = useFeedColumnCount()
  const columns = distributeColumns(cards, columnCount, leaderboard, handleOpen, handleAspectRatio)

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
        <div className="flex items-start gap-3">
          {columns.map((col, i) => (
            <div key={`col-${i}`} className="min-w-0 flex-1">
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
