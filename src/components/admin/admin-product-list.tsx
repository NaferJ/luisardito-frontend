"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { ArchiveProductButton } from "@/components/admin/archive-product-button"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"

type SortKey = "nombre" | "precio" | "stock" | "canjes_count" | "actualizado"
type SortDir = "asc" | "desc"

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "nombre", label: "Name", className: "min-w-0 flex-1" },
  { key: "precio", label: "Price", className: "w-24 shrink-0 text-right" },
  { key: "stock", label: "Stock", className: "w-20 shrink-0 text-right" },
  { key: "canjes_count", label: "Redemptions", className: "w-28 shrink-0 text-right" },
  { key: "actualizado", label: "Updated", className: "w-24 shrink-0 text-right" },
]

/** Relative time formatter: "2d ago", "1w ago", "just now". */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  return `${months}mo ago`
}

export function AdminProductList({ products }: { products: Producto[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("updated_at")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const visibleProducts = useMemo(() => {
    let filtered = products
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      filtered = products.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          (p.slug?.toLowerCase().includes(term) ?? false),
      )
    }

    const sorted = [...filtered].sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "nombre":
          cmp = a.nombre.localeCompare(b.nombre)
          break
        case "precio":
          cmp = a.precio - b.precio
          break
        case "stock":
          cmp = a.stock - b.stock
          break
        case "canjes_count":
          cmp = (a.canjes_count ?? 0) - (b.canjes_count ?? 0)
          break
        case "actualizado":
          cmp = new Date(a.actualizado ?? a.updated_at).getTime() - new Date(b.actualizado ?? b.updated_at).getTime()
          break
      }
      return sortDir === "asc" ? cmp : -cmp
    })

    return sorted
  }, [products, search, sortKey, sortDir])

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Products</h1>
          <span className="text-[13px] text-muted-foreground">
            {visibleProducts.length} of {products.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex h-8 items-center">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              aria-label="Search products"
              className="h-8 w-44 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-56 focus:border-gold focus:outline-none transition-all"
            />
          </div>

          {/* New product */}
          <button
            type="button"
            onClick={() => router.push("/shop/admin/products/new")}
            className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
          >
            <Plus className="size-3.5" />
            New product
          </button>
        </div>
      </div>

      {/* Table */}
      {visibleProducts.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Column headers */}
          <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5">
            <span className="w-10 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Img
            </span>
            {COLUMNS.map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => toggleSort(col.key)}
                className={cn(
                  "flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                  col.className,
                  (col.key === "precio" || col.key === "stock" || col.key === "canjes_count" || col.key === "updated_at") && "justify-end",
                )}
              >
                {col.label}
                <SortIcon column={col.key} />
              </button>
            ))}
            <span className="w-24 shrink-0 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {visibleProducts.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/shop/admin/products/${p.id}/edit`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    router.push(`/shop/admin/products/${p.id}/edit`)
                  }
                }}
                className="flex cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30"
              >
                {/* Image */}
                <div className="size-10 shrink-0 overflow-hidden rounded-sm bg-secondary">
                  {(p.imagen || p.imagen_url) && (
                    <Image
                      src={p.imagen || p.imagen_url!}
                      alt={p.nombre}
                      width={40}
                      height={40}
                      className="size-full object-cover"
                      unoptimized
                    />
                  )}
                </div>

                {/* Name + slug */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-foreground">{p.nombre}</p>
                  <p className="truncate text-[12px] text-muted-foreground">
                    {p.slug ?? `id:${p.id}`}
                  </p>
                </div>

                {/* Price */}
                <span className="w-24 shrink-0 text-right text-[13px] tabular-nums text-foreground">
                  {p.precio.toLocaleString()} pts
                </span>

                {/* Stock */}
                <span
                  className={cn(
                    "w-20 shrink-0 text-right text-[13px] tabular-nums",
                    p.stock === 0 ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {p.stock}
                </span>

                {/* Redemptions */}
                <span className="w-28 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
                  {p.canjes_count ?? 0}
                </span>

                {/* Updated */}
                <span className="w-24 shrink-0 text-right text-[12px] text-muted-foreground">
                  {relativeTime(p.actualizado ?? p.updated_at)}
                </span>

                {/* Actions (stopPropagation so row click doesn't fire) */}
                <div className="flex w-24 shrink-0 items-center justify-end gap-2">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      p.estado === "publicado"
                        ? "bg-gold/15 text-gold-bright"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {p.estado === "publicado" ? "Live" : "Draft"}
                  </span>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ArchiveProductButton id={String(p.id)} name={p.nombre} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
          <div className="flex flex-col items-center gap-3">
            <p className="text-[13px] text-muted-foreground">
              {search.trim() ? `No products match "${search.trim()}".` : "No products yet."}
            </p>
            {!search.trim() && (
              <button
                type="button"
                onClick={() => router.push("/shop/admin/products/new")}
                className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
              >
                <Plus className="size-3.5" />
                Create your first product
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
