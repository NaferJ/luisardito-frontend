"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { ProductFeed } from "@/components/product-feed"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"
import type { LeaderboardEntry } from "@/lib/leaderboard"

/**
 * Sort orders for the shop feed — mutually exclusive, shown as a single
 * compact dropdown rather than a row of pills. "On Sale" used to be mixed
 * into this list as a pill of equal visual weight, even though it behaves
 * completely differently (a filter, not a sort) — that's what read as
 * "confusing categories". It's now a separate toggle, see `onSaleOnly`.
 */
type SortMode = "price_desc" | "price_asc" | "stock_desc" | "canjes_desc" | "newest"

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "price_desc", label: "Highest price" },
  { mode: "price_asc", label: "Lowest price" },
  { mode: "stock_desc", label: "Most stock" },
  { mode: "canjes_desc", label: "Most redeemed" },
  { mode: "newest", label: "Newest" },
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
  }
  return sorted
}

/**
 * Extract the slug from a pathname like "/shop/miku" → "miku".
 * Returns null for "/shop" (no slug).
 */
function slugFromPathname(pathname: string): string | null {
  if (pathname === "/shop") return null
  const match = /^\/shop\/(.+)$/.exec(pathname)
  return match ? decodeURIComponent(match[1]) : null
}

export function ShopBrowse({
  products,
  leaderboard = [],
  initialOpenSlug = null,
}: Readonly<{
  products: Producto[]
  leaderboard?: LeaderboardEntry[]
  /** Slug of the product to open on initial load (direct link from [slug] page). */
  initialOpenSlug?: string | null
}>) {
  const [openSlug, setOpenSlug] = useState<string | null>(initialOpenSlug)
  const [sortMode, setSortMode] = useState<SortMode>("price_desc")
  const [onSaleOnly, setOnSaleOnly] = useState(false)
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
    const filtered = onSaleOnly ? products.filter((p) => p.descuento?.tieneDescuento) : products
    const sorted = sortProducts(filtered, sortMode)
    if (!search.trim()) return sorted
    const term = search.trim().toLowerCase()
    return sorted.filter(
      (p) =>
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term),
    )
  }, [products, sortMode, onSaleOnly, search])

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
      {/* Sort dropdown + On Sale toggle + search. Sort and "On Sale" used to
          be six pills of equal visual weight, mixing a single-select sort
          order with an unrelated filter — confusing to scan. Now it's one
          compact sort dropdown plus one clearly separate filter toggle. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {/* Mobile: compact sort dropdown so a row of 5 long pills doesn't
              wrap and fight for space next to the On Sale toggle. */}
          <div className="relative lg:hidden">
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Sort products"
              className="h-8 appearance-none rounded-full border border-border bg-secondary pl-3.5 pr-8 text-[13px] font-medium text-foreground focus:border-gold focus:outline-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.mode} value={option.mode}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </div>

          {/* Desktop: all sort orders visible as pills for direct scanning. */}
          <div className="hidden items-center gap-2 lg:flex">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.mode}
                type="button"
                onClick={() => setSortMode(option.mode)}
                aria-pressed={sortMode === option.mode}
                className={cn(
                  "h-8 rounded-full px-3.5 text-[13px] font-medium transition-[colors,transform] duration-150 active:scale-95",
                  sortMode === option.mode
                    ? "bg-foreground text-background"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setOnSaleOnly((v) => !v)}
            aria-pressed={onSaleOnly}
            className={cn(
              "h-8 rounded-full px-3.5 text-[13px] font-medium transition-[colors,transform] duration-150 active:scale-95",
              onSaleOnly
                ? "bg-gold text-gold-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            On Sale
          </button>
        </div>

        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
          {/* Result count */}
          <span className="shrink-0 text-[13px] text-muted-foreground">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "product" : "products"}
          </span>

          {/* Search input — wide enough by default to show the full
              placeholder without relying on the focus-only expansion. */}
          <div className="relative flex h-8 w-full max-w-sm items-center sm:flex-initial sm:w-56">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-8 w-full rounded-full border border-border bg-secondary pl-8 pr-7 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 flex size-4 items-center justify-center text-muted-foreground transition-transform active:scale-90 hover:text-foreground"
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
