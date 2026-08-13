"use client"

import { useMemo, useState } from "react"
import {
  Search,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Calendar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Canje } from "@/types"

type SortMode = "date-desc" | "date-asc" | "price-desc" | "price-asc"
type StatusFilter = "all" | "pendiente" | "entregado" | "cancelado" | "devuelto"

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "date-desc", label: "Newest" },
  { mode: "date-asc", label: "Oldest" },
  { mode: "price-desc", label: "Highest price" },
  { mode: "price-asc", label: "Lowest price" },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pendiente", label: "Pending" },
  { value: "entregado", label: "Delivered" },
  { value: "cancelado", label: "Cancelled" },
  { value: "devuelto", label: "Returned" },
]

const STATUS_STYLES: Record<string, { icon: typeof Clock; className: string; label: string }> = {
  pendiente: { icon: Clock, className: "text-gold-bright", label: "Pending" },
  entregado: { icon: CheckCircle2, className: "text-foreground", label: "Delivered" },
  cancelado: { icon: XCircle, className: "text-destructive", label: "Cancelled" },
  devuelto: { icon: RotateCcw, className: "text-muted-foreground", label: "Returned" },
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

function canjePrice(c: Canje): number {
  return c.precio_al_canje ?? c.producto?.precio ?? 0
}

function canjeName(c: Canje): string {
  return c.producto?.nombre ?? "Product unavailable"
}

function canjeImage(c: Canje): string | null {
  return c.producto?.imagen_url ?? c.producto?.imagen ?? null
}

export function CanjesList({ canjes }: { canjes: Canje[]; userPoints: number }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortMode, setSortMode] = useState<SortMode>("date-desc")

  const stats = useMemo(() => {
    const pendientes = canjes.filter((c) => c.estado === "pendiente").length
    const entregados = canjes.filter((c) => c.estado === "entregado").length
    const cancelados = canjes.filter((c) => c.estado === "cancelado").length
    const totalPuntos = canjes.reduce((sum, c) => sum + canjePrice(c), 0)
    return { total: canjes.length, pendientes, entregados, cancelados, totalPuntos }
  }, [canjes])

  const filtered = useMemo(() => {
    let result = [...canjes]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter((c) => canjeName(c).toLowerCase().includes(term))
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.estado === statusFilter)
    }
    result.sort((a, b) => {
      switch (sortMode) {
        case "date-desc":
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        case "date-asc":
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        case "price-desc":
          return canjePrice(b) - canjePrice(a)
        case "price-asc":
          return canjePrice(a) - canjePrice(b)
      }
    })
    return result
  }, [canjes, search, statusFilter, sortMode])

  const hasActiveFilters = search !== "" || statusFilter !== "all" || sortMode !== "date-desc"

  if (canjes.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8">
        <ShoppingBag className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-medium text-foreground">No redemptions yet</p>
        <p className="text-[13px] text-muted-foreground">
          Browse the shop and redeem products with your points.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatChip label={`${stats.total} ${stats.total === 1 ? "redemption" : "redemptions"}`} />
        {stats.pendientes > 0 && (
          <StatChip label={`${stats.pendientes} pending`} accent="gold" />
        )}
        {stats.entregados > 0 && (
          <StatChip label={`${stats.entregados} delivered`} />
        )}
        {stats.cancelados > 0 && (
          <StatChip label={`${stats.cancelados} cancelled`} />
        )}
        <StatChip label={`${stats.totalPuntos.toLocaleString()} pts spent`} outline />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-3 sm:flex-row sm:items-center">
        <div className="relative flex h-8 items-center sm:max-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            aria-label="Search redemptions"
            className="h-8 w-full rounded-full border border-border bg-background pl-8 pr-7 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
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

        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStatusFilter(opt.value)}
              aria-pressed={statusFilter === opt.value}
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
                statusFilter === opt.value
                  ? "bg-gold text-gold-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            aria-label="Sort by"
            className="h-7 rounded-full border border-border bg-background px-3 text-[12px] text-foreground focus:border-gold focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.mode} value={opt.mode}>
                {opt.label}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setStatusFilter("all")
                setSortMode("date-desc")
              }}
              className="text-[12px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
          <span className="shrink-0 text-[12px] text-muted-foreground">
            {filtered.length}/{canjes.length}
          </span>
        </div>
      </div>

      {/* Redemption list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-sm border border-dashed border-border p-6">
          <p className="text-[13px] text-muted-foreground">No results match your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((canje) => {
            const status = STATUS_STYLES[canje.estado] ?? STATUS_STYLES.pendiente
            const StatusIcon = status.icon
            const img = canjeImage(canje)
            return (
              <div
                key={canje.id}
                className="flex gap-3 rounded-sm border border-border bg-secondary p-3 transition-colors hover:border-gold/50"
              >
                {/* Thumbnail */}
                <div className="size-16 shrink-0 overflow-hidden rounded-sm bg-muted">
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
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <span className="truncate text-[14px] font-medium text-foreground">
                    {canjeName(canje)}
                  </span>
                  <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    <Calendar className="size-3" aria-hidden="true" />
                    {formatDate(canje.fecha)}
                  </div>
                </div>

                {/* Price + status */}
                <div className="flex shrink-0 flex-col items-end justify-center gap-1">
                  <span className="text-[16px] font-semibold text-gold-bright">
                    {canjePrice(canje).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">pts</span>
                  <div className={cn("flex items-center gap-1 text-[12px] font-medium", status.className)}>
                    <StatusIcon className="size-3" aria-hidden="true" />
                    {status.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="text-center text-[12px] text-muted-foreground">
          Pending redemptions are processed within 24–48 hours.
        </p>
      )}
    </div>
  )
}

function StatChip({
  label,
  accent,
  outline,
}: {
  label: string
  accent?: "gold"
  outline?: boolean
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium",
        outline
          ? "border border-border text-foreground"
          : accent === "gold"
            ? "bg-gold/20 text-gold-bright"
            : "bg-secondary text-muted-foreground",
      )}
    >
      {label}
    </span>
  )
}
