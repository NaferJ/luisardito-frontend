"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  Plus,
  Package,
  CheckCircle2,
  FileEdit,
  PackageX,
  ShoppingBag,
} from "lucide-react"
import { ArchiveProductButton } from "@/components/admin/archive-product-button"
import { cn, formatCompactNumber } from "@/lib/utils"
import { downloadCSV } from "@/lib/admin-csv"
import { PAGE_SIZE_OPTIONS } from "@/lib/admin-utils"
import { StatCard } from "@/components/admin/shared/stat-card"
import { FilterPills } from "@/components/admin/shared/filter-pills"
import { SortHeader } from "@/components/admin/shared/sort-header"
import { SearchInput, CsvButton } from "@/components/admin/shared/list-toolbar"
import { Pagination } from "@/components/admin/shared/pagination"
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

export function AdminProductList({ products }: Readonly<{ products: Producto[] }>) {
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
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search name, slug..."
            ariaLabel="Search products"
          />

          {/* CSV export */}
          <CsvButton onClick={() => exportCSV(visibleProducts)} />

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
      <FilterPills
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={onStatusChange}
      />

      {/* Table */}
      {paginated.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Column headers */}
          <SortHeader
            columns={COLUMNS.map((c) => ({ ...c, alignRight: c.key === "precio" || c.key === "stock" || c.key === "canjes_count" || c.key === "actualizado" }))}
            sortKey={sortKey}
            sortDir={sortDir}
            onSort={toggleSort}
            leadingLabel="Img"
            leadingClassName="w-10 shrink-0"
            trailingLabel="Actions"
          />

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
                  {formatCompactNumber(p.precio)} pts
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
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={visibleProducts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={onPageSizeChange}
          />
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
