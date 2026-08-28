"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { ProductFeed } from "@/components/product-feed"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"
import type { LeaderboardEntry } from "@/lib/leaderboard"

/**
 * Sort/filter modes for the shop feed. The first five are sort orders
 * (mutually exclusive); "On Sale" is a filter that shows only discounted
 * products, sorted by discount percentage descending.
 */
type SortMode = "price_desc" | "price_asc" | "stock_desc" | "canjes_desc" | "newest" | "sale"

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "price_desc", label: "Highest price" },
  { mode: "price_asc", label: "Lowest price" },
  { mode: "stock_desc", label: "Most stock" },
  { mode: "canjes_desc", label: "Most redeemed" },
  { mode: "newest", label: "Newest" },
  { mode: "sale", label: "On Sale" },
]

/** URL-safe identifier for a product: slug if available, otherwise ID. */
function productSlug(product: Producto): string {
  return product.slug || String(product.id)
}

function sortProducts(products: Producto[], mode: SortMode): Producto[] {
  const sorted = [...products]
  switch (mode) {
    case "price_asc":
      sorted.sort((a, b) => a.precio - b.precio)
      break
    case "price_desc":
      sorted.sort((a, b) => b.precio - a.precio)
      break
    case "stock_desc":
      sorted.sort((a, b) => b.stock - a.stock)
      break
    case "canjes_desc":
      sorted.sort((a, b) => (b.canjes_count ?? 0) - (a.canjes_count ?? 0))
      break
    case "newest":
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      break
    case "sale":
      // Filter to discounted products, then sort by discount percentage descending.
      // The percentage is stored as a string in porcentajeDescuento, so parse it.
      return sorted
        .filter((p) => p.descuento?.tieneDescuento)
        .sort((a, b) => {
          const aPct = parseFloat(a.descuento?.porcentajeDescuento ?? "0")
          const bPct = parseFloat(b.descuento?.porcentajeDescuento ?? "0")
          return bPct - aPct
        })
  }
  return sorted
}

/**
 * Extract the slug from a pathname like "/shop/miku" → "miku".
 * Returns null for "/shop" (no slug).
 */
function slugFromPathname(pathname: string): string | null {
  if (pathname === "/shop") return null
  const match = pathname.match(/^\/shop\/(.+)$/)
  return match ? decodeURIComponent(match[1]) : null
}

export function ShopBrowse({
  products,
  leaderboard = [],
  initialOpenSlug = null,
}: {
  products: Producto[]
  leaderboard?: LeaderboardEntry[]
  /** Slug of the product to open on initial load (direct link from [slug] page). */
  initialOpenSlug?: string | null
}) {
  const [openSlug, setOpenSlug] = useState<string | null>(initialOpenSlug)
  const [sortMode, setSortMode] = useState<SortMode>("price_desc")
  const [search, setSearch] = useState("")

  // Sync openSlug with browser back/forward. pushState updates the URL without
  // triggering a Next.js navigation (no skeleton, no refetch), so we need this
  // listener to catch popstate events and keep the overlay in sync.
  useEffect(() => {
    const handlePopState = () => {
      const slug = slugFromPathname(window.location.pathname)
      setOpenSlug(slug)
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const visibleProducts = useMemo(() => {
    const sorted = sortProducts(products, sortMode)
    if (!search.trim()) return sorted
    const term = search.trim().toLowerCase()
    return sorted.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term),
    )
  }, [products, sortMode, search])

  // Derive the open index from the slug, not a fixed position, so the overlay
  // stays on the right product even when sort/search reorders the list. If the
  // product is filtered out by search, the overlay won't render.
  const openIndex = useMemo(() => {
    if (!openSlug) return null
    const idx = visibleProducts.findIndex((p) => productSlug(p) === openSlug)
    return idx >= 0 ? idx : null
  }, [visibleProducts, openSlug])

  return (
    <div className="flex flex-col gap-6">
      {/* Sort pills + search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.mode}
              type="button"
              onClick={() => setSortMode(option.mode)}
              aria-pressed={sortMode === option.mode}
              className={cn(
                "h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors",
                sortMode === option.mode
                  ? "bg-gold text-gold-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Result count */}
          <span className="shrink-0 text-[13px] text-muted-foreground">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
          </span>

          {/* Search input */}
          <div className="relative flex h-8 items-center">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-8 w-40 rounded-full border border-border bg-secondary pl-8 pr-7 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-56 focus:border-gold focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {visibleProducts.length > 0 ? (
        <ProductFeed
          products={visibleProducts}
          leaderboard={leaderboard}
          initialOpenIndex={openIndex}
          onCardOpen={(slug) => {
            setOpenSlug(slug)
            window.history.pushState(null, "", `/shop/${slug}`)
          }}
          onOverlayClose={() => {
            setOpenSlug(null)
            window.history.pushState(null, "", "/shop")
          }}
          onOverlayNavigate={(nextIndex) => {
            const product = visibleProducts[nextIndex]
            if (product) {
              const slug = productSlug(product)
              setOpenSlug(slug)
              window.history.pushState(null, "", `/shop/${slug}`)
            }
          }}
        />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border p-8">
          <p className="text-[13px] text-muted-foreground">
            {search.trim()
              ? `No products match "${search.trim()}".`
              : "No products available right now. Check back soon."}
          </p>
        </div>
      )}
    </div>
  )
}
