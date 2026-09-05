"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react"
import { cn, formatCompactNumber } from "@/lib/utils"
import { formatDateTime as formatDate } from "@/lib/admin-utils"
import type { Canje, Producto } from "@/types"
import type {
  CanjesSort,
  CanjesStatus,
  MyCanjesPagination,
  MyCanjesSummary,
} from "@/lib/canjes"

type StatusFilter = CanjesStatus | "all"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pendiente", label: "Pending" },
  { value: "entregado", label: "Delivered" },
  { value: "cancelado", label: "Cancelled" },
  { value: "devuelto", label: "Returned" },
]

const STATUS_STYLES: Record<
  CanjesStatus,
  { icon: typeof Clock; className: string; cardClassName: string; label: string }
> = {
  pendiente: {
    icon: Clock,
    className: "border-gold/30 bg-gold/10 text-gold-bright",
    cardClassName: "border-gold/30",
    label: "Pending",
  },
  entregado: {
    icon: CheckCircle2,
    className: "border-border bg-foreground/5 text-foreground",
    cardClassName: "border-border",
    label: "Delivered",
  },
  cancelado: {
    icon: XCircle,
    className: "border-destructive/25 bg-destructive/10 text-destructive",
    cardClassName: "border-destructive/20",
    label: "Cancelled",
  },
  devuelto: {
    icon: RotateCcw,
    className: "border-border bg-muted text-muted-foreground",
    cardClassName: "border-border",
    label: "Returned",
  },
}

function canjeProduct(c: Canje): Producto | undefined {
  return c.Producto ?? c.producto
}

function canjePrice(c: Canje): number {
  return c.precio_al_canje ?? canjeProduct(c)?.precio ?? 0
}

function canjeName(c: Canje): string {
  return canjeProduct(c)?.nombre ?? "Product unavailable"
}

function canjeImage(c: Canje): string | null {
  const product = canjeProduct(c)
  return product?.imagen_url ?? product?.imagen ?? null
}

function canjeHref(c: Canje): string | null {
  const product = canjeProduct(c)
  if (!product || product.estado === "eliminado") return null
  return `/shop/${product.slug || product.id}`
}

function RedemptionCard({ canje }: Readonly<{ canje: Canje }>) {
  const status = STATUS_STYLES[canje.estado]
  const StatusIcon = status.icon
  const img = canjeImage(canje)
  const href = canjeHref(canje)

  const content = (
    <>
      {/* Thumbnail */}
      <div className="size-20 shrink-0 overflow-hidden rounded-sm bg-muted sm:size-24">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={canjeName(canje)} className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center">
            <ShoppingBag className="size-5 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 py-0.5">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-foreground">
              {canjeName(canje)}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Redemption #{canje.id}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-[16px] font-semibold tabular-nums text-gold-bright">
              {formatCompactNumber(canjePrice(canje))}
            </span>
            <span className="ml-1 text-[11px] text-muted-foreground">pts</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            {formatDate(canje.fecha)}
          </span>
          <span
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium",
              status.className,
            )}
          >
            <StatusIcon className="size-3.5" aria-hidden="true" />
            {status.label}
          </span>
        </div>
      </div>

      {href && (
        <ArrowUpRight
          className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden="true"
        />
      )}
    </>
  )

  const className = cn(
    "group flex min-w-0 gap-3 rounded-sm border bg-card p-3 transition-colors",
    status.cardClassName,
    href && "hover:border-gold/50 hover:bg-secondary/60",
  )

  if (href) {
    return (
      <Link href={href} className={className} aria-label={`View ${canjeName(canje)}`}>
        {content}
      </Link>
    )
  }

  return <div className={className}>{content}</div>
}

export function CanjesList({
  canjes,
  pagination,
  summary,
  currentPage,
  statusFilter,
  sortMode,
}: Readonly<{
  canjes: Canje[]
  pagination: MyCanjesPagination
  summary: MyCanjesSummary
  currentPage: number
  statusFilter: StatusFilter
  sortMode: CanjesSort
}>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit))
  const hasActiveFilters = statusFilter !== "all" || sortMode !== "date-desc"

  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    const query = next.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const clearFilters = () => {
    updateQuery({ status: null, sort: null, page: null })
  }

  if (summary.total === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8 text-center">
        <ShoppingBag className="size-8 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="text-[15px] font-medium text-foreground">No redemptions yet</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Your redeemed rewards and their status will appear here.
          </p>
        </div>
        <Link
          href="/shop"
          className="mt-1 rounded-full bg-gold px-4 py-2 text-[12px] font-medium text-gold-foreground transition-[colors,transform] hover:bg-gold-bright active:scale-95"
        >
          Browse rewards
        </Link>
      </div>
    )
  }

  const rangeStart = pagination.offset + 1
  const rangeEnd = pagination.offset + canjes.length
  const isEmptyPage = canjes.length === 0

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="flex flex-col justify-between gap-3 rounded-sm border border-border bg-card px-4 py-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-[11px] text-muted-foreground">Points spent</p>
          <p className="text-[22px] font-semibold leading-tight tabular-nums text-gold-bright">
            {formatCompactNumber(summary.total_points)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
          <span>
            <span className="font-medium text-foreground">{summary.total}</span>{" "}
            {summary.total === 1 ? "redemption" : "redemptions"}
          </span>
          {summary.by_status.pendiente > 0 && (
            <span>
              <span className="font-medium text-gold-bright">{summary.by_status.pendiente}</span>{" "}
              pending
            </span>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="rounded-sm border border-border bg-secondary p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-foreground">Redemption history</p>
            <p className="text-[11px] text-muted-foreground">
              {pagination.total} matching {pagination.total === 1 ? "redemption" : "redemptions"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <select
              value={sortMode}
              onChange={(e) => updateQuery({ sort: e.target.value === "date-desc" ? null : e.target.value, page: null })}
              aria-label="Sort redemptions"
              className="h-8 max-w-[132px] rounded-full border border-border bg-background px-3 text-[12px] text-foreground focus:border-gold focus:outline-none"
            >
              <option value="date-desc">Newest first</option>
              <option value="date-asc">Oldest first</option>
            </select>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="h-8 rounded-full px-2 text-[12px] text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-0.5" aria-label="Filter by status">
          {STATUS_OPTIONS.map((option) => {
            const count = option.value === "all" ? summary.total : summary.by_status[option.value]
            const selected = statusFilter === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  updateQuery({
                    status: option.value === "all" ? null : option.value,
                    page: null,
                  })
                }
                aria-pressed={selected}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[12px] font-medium transition-colors",
                  selected
                    ? "bg-gold text-gold-foreground"
                    : "bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "text-[10px]",
                    selected ? "text-gold-foreground/70" : "text-muted-foreground/70",
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Redemption list */}
      {isEmptyPage ? (
        <div className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-6 text-center">
          <p className="text-[14px] font-medium text-foreground">No redemptions match this filter</p>
          <p className="text-[12px] text-muted-foreground">Try another status or reset the filters.</p>
          <button
            type="button"
            onClick={clearFilters}
            className="text-[12px] font-medium text-foreground underline underline-offset-4"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid gap-2 lg:grid-cols-2">
          {canjes.map((canje) => (
            <RedemptionCard key={canje.id} canje={canje} />
          ))}
        </div>
      )}

      {pagination.total > 0 && (
        <nav
          className="flex flex-col gap-3 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between"
          aria-label="Redemptions pagination"
        >
          <p className="text-[12px] text-muted-foreground">
            {rangeStart}–{rangeEnd} of {pagination.total}
          </p>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => updateQuery({ page: currentPage > 2 ? String(currentPage - 1) : null })}
              disabled={currentPage <= 1}
              className="flex h-8 items-center gap-1 rounded-full border border-border px-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
              Previous
            </button>
            <span className="text-[12px] tabular-nums text-foreground">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => updateQuery({ page: String(currentPage + 1) })}
              disabled={!pagination.has_more}
              className="flex h-8 items-center gap-1 rounded-full border border-border px-3 text-[12px] text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}
