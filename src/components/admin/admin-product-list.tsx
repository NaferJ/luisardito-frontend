"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Search,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Package,
  CheckCircle2,
  FileEdit,
  PackageX,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { ArchiveProductButton } from "@/components/admin/archive-product-button"
import { cn } from "@/lib/utils"
import { downloadCSV } from "@/lib/admin-csv"
import { PAGE_SIZE_OPTIONS } from "@/lib/admin-utils"
import type { Producto } from "@/types"

type SortKey = "nombre" | "precio" | "stock" | "canjes_count" | "actualizado"
type SortDir = "asc" | "desc"
type StatusFilter = "all" | "publicado" | "borrador" | "out_of_stock"

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "nombre", label: "Name", className: "min-w-0 flex-1" },
  { key: "precio", label: "Price", className: "w-24 shrink-0 text-right" },
  { key: "stock", label: "Stock", className: "w-20 shrink-0 text-right" },
  { key: "canjes_count", label: "Redemptions", className: "w-28 shrink-0 text-right" },
  { key: "actualizado", label: "Updated", className: "w-24 shrink-0 text-right" },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "publicado", label: "Live" },
  { value: "borrador", label: "Drafts" },
  { value: "out_of_stock", label: "Out of stock" },
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

function exportCSV(products: Producto[]): void {
  const headers = ["ID", "Name", "Slug", "Price", "Stock", "Status", "Redemptions", "Updated"]
  const rows = products.map((p) => [
    p.id,
    p.nombre,
    p.slug ?? "",
    p.precio,
    p.stock,
    p.estado,
    p.canjes_count ?? 0,
    new Date(p.actualizado ?? p.updated_at).toISOString(),
  ])
  downloadCSV("products", headers, rows)
}

export function AdminProductList({ products }: { products: Producto[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("actualizado")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20)
  const [currentPage, setCurrentPage] = useState(1)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const stats = useMemo(() => {
    const total = products.length
    const live = products.filter((p) => p.estado === "publicado").length
    const drafts = products.filter((p) => p.estado === "borrador").length
    const outOfStock = products.filter((p) => p.stock === 0).length
    const totalRedemptions = products.reduce((sum, p) => sum + (p.canjes_count ?? 0), 0)
    return { total, live, drafts, outOfStock, totalRedemptions }
  }, [products])

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
    switch (statusFilter) {
      case "publicado": filtered = filtered.filter((p) => p.estado === "publicado"); break
      case "borrador": filtered = filtered.filter((p) => p.estado === "borrador"); break
      case "out_of_stock": filtered = filtered.filter((p) => p.stock === 0); break
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
  }, [products, search, statusFilter, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(visibleProducts.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = visibleProducts.slice((safePage - 1) * pageSize, safePage * pageSize)

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-30" />
    return sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
  }

  const onSearchChange = (v: string) => { setSearch(v); setCurrentPage(1) }
  const onStatusChange = (v: StatusFilter) => { setStatusFilter(v); setCurrentPage(1) }
  const onPageSizeChange = (s: (typeof PAGE_SIZE_OPTIONS)[number]) => { setPageSize(s); setCurrentPage(1) }

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
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search name, slug..."
              aria-label="Search products"
              className="h-8 w-52 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-64 focus:border-gold focus:outline-none transition-all"
            />
          </div>

          {/* CSV export */}
          <button
            type="button"
            onClick={() => exportCSV(visibleProducts)}
            className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            aria-label="Export CSV"
            title="Export filtered results as CSV"
          >
            <Download className="size-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

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

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={<Package className="size-3.5" />} label="Total" value={stats.total} />
        <StatCard icon={<CheckCircle2 className="size-3.5" />} label="Live" value={stats.live} valueClass="text-gold-bright" />
        <StatCard icon={<FileEdit className="size-3.5" />} label="Drafts" value={stats.drafts} />
        <StatCard icon={<PackageX className="size-3.5" />} label="Out of stock" value={stats.outOfStock} valueClass="text-destructive" />
        <StatCard icon={<ShoppingBag className="size-3.5" />} label="Redemptions" value={stats.totalRedemptions} />
      </div>

      {/* Filters row: status pills */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onStatusChange(opt.value)}
            aria-pressed={statusFilter === opt.value}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
              statusFilter === opt.value
                ? "bg-gold text-gold-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {paginated.length > 0 ? (
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
                  (col.key === "precio" || col.key === "stock" || col.key === "canjes_count" || col.key === "actualizado") && "justify-end",
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
            {paginated.map((p) => (
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
                      src={p.imagen ?? p.imagen_url ?? ""}
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
                <div className="flex w-24 shrink-0 items-center justify-end gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
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
                  <ArchiveProductButton id={String(p.id)} name={p.nombre} />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span>
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, visibleProducts.length)} of {visibleProducts.length}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value) as (typeof PAGE_SIZE_OPTIONS)[number])}
                  className="h-7 rounded-sm border border-border bg-background px-2 text-[12px] text-foreground focus:border-gold focus:outline-none"
                  aria-label="Page size"
                >
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}/page</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                  disabled={safePage === 1}
                  className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="px-2 text-[12px] tabular-nums text-foreground">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                  disabled={safePage === totalPages}
                  className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  aria-label="Next page"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          )}
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

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: number
  valueClass?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-secondary p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className={cn("text-[20px] font-bold tabular-nums", valueClass ?? "text-foreground")}>
        {value}
      </span>
    </div>
  )
}
