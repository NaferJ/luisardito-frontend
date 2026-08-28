"use client"

import { useMemo, useState } from "react"
import {
  Search,
  X,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  UserPlus,
  Star,
  Gift,
  ArrowLeftRight,
  Calendar,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDateTime as formatDate } from "@/lib/admin-utils"
import type { HistorialPunto } from "@/types"

type SortMode = "date-desc" | "date-asc" | "points-desc" | "points-asc"
type FilterType = "all" | "positive" | "negative" | "vip" | "migration" | "gifts"

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "date-desc", label: "Newest" },
  { mode: "date-asc", label: "Oldest" },
  { mode: "points-desc", label: "Most points" },
  { mode: "points-asc", label: "Fewest points" },
]

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "positive", label: "Earned" },
  { value: "negative", label: "Spent" },
  { value: "vip", label: "VIP" },
  { value: "migration", label: "Migration" },
  { value: "gifts", label: "Gifts" },
]

function getEventIcon(item: HistorialPunto): typeof MessageSquare {
  const concept = item.concepto ?? item.motivo ?? ""
  const eventData = item.kick_event_data
  if (eventData?.event_type === "botrix_migration") return ArrowLeftRight
  if (eventData?.event_type === "vip_granted") return Star
  if (eventData?.event_type === "kicks.gifted") return Gift
  if (concept.includes("VIP") || eventData?.is_vip) return Star
  if (concept.includes("chat") || concept.includes("message")) return MessageSquare
  if (concept.includes("follow")) return UserPlus
  if (concept.includes("sub")) return Star
  return ArrowLeftRight
}

function getEventTitle(item: HistorialPunto): string {
  const concept = item.concepto ?? item.motivo ?? ""
  const eventData = item.kick_event_data
  if (eventData?.event_type === "botrix_migration") return "Botrix migration"
  if (eventData?.event_type === "vip_granted") {
    const duration = eventData.duration_days ? `${eventData.duration_days}d` : "permanent"
    return `VIP granted (${duration})`
  }
  if (eventData?.event_type === "kicks.gifted") {
    return `Gift of ${eventData.kick_amount ?? 0} kicks`
  }
  return concept || "Points movement"
}

function getCambio(item: HistorialPunto): number {
  return item.cambio ?? item.puntos ?? 0
}

export function HistorialList({
  historial,
}: Readonly<{
  historial: HistorialPunto[]
}>) {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [sortMode, setSortMode] = useState<SortMode>("date-desc")

  // Calculate running balance (ascending by date) using reduce to avoid
  // reassigning a closure variable inside .map() (react-hooks/immutability).
  const withSaldo = useMemo(() => {
    const sorted = [...historial].sort(
      (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
    )
    return sorted.reduce<
      { saldo: number; items: (HistorialPunto & { saldo_actual: number })[] }
    >(
      (acc, item) => {
        const newSaldo = acc.saldo + getCambio(item)
        return {
          saldo: newSaldo,
          items: [...acc.items, { ...item, saldo_actual: newSaldo }],
        }
      },
      { saldo: 0, items: [] },
    ).items
  }, [historial])

  const stats = useMemo(() => {
    const ganados = withSaldo.filter((h) => getCambio(h) > 0).reduce((s, h) => s + getCambio(h), 0)
    const gastados = withSaldo
      .filter((h) => getCambio(h) < 0)
      .reduce((s, h) => s + Math.abs(getCambio(h)), 0)
    const positiveCount = withSaldo.filter((h) => getCambio(h) > 0).length
    return {
      total: withSaldo.length,
      ganados,
      gastados,
      balance: ganados - gastados,
      avg: positiveCount > 0 ? Math.round(ganados / positiveCount) : 0,
    }
  }, [withSaldo])

  const filtered = useMemo(() => {
    let result = [...withSaldo]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter((item) => {
        const concept = item.concepto ?? item.motivo ?? ""
        return concept.toLowerCase().includes(term)
      })
    }
    if (filterType !== "all") {
      result = result.filter((item) => {
        const concept = item.concepto ?? item.motivo ?? ""
        const eventData = item.kick_event_data
        switch (filterType) {
          case "positive":
            return getCambio(item) > 0
          case "negative":
            return getCambio(item) < 0
          case "vip":
            return concept.includes("VIP") || eventData?.is_vip
          case "migration":
            return eventData?.event_type === "botrix_migration"
          case "gifts":
            return eventData?.event_type === "kicks.gifted"
          default:
            return true
        }
      })
    }
    result.sort((a, b) => {
      switch (sortMode) {
        case "date-desc":
          return new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        case "date-asc":
          return new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        case "points-desc":
          return Math.abs(getCambio(b)) - Math.abs(getCambio(a))
        case "points-asc":
          return Math.abs(getCambio(a)) - Math.abs(getCambio(b))
      }
    })
    return result
  }, [withSaldo, search, filterType, sortMode])

  const hasActiveFilters = search !== "" || filterType !== "all" || sortMode !== "date-desc"

  if (historial.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8">
        <Clock className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-medium text-foreground">No points history yet</p>
        <p className="text-[13px] text-muted-foreground">
          Start watching streams to earn points and build your history.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stats row */}
      <div className="flex flex-wrap gap-2">
        <StatChip label={`${stats.total} ${stats.total === 1 ? "entry" : "entries"}`} />
        <StatChip label={`+${stats.ganados.toLocaleString()} earned`} accent="positive" />
        {stats.gastados > 0 && (
          <StatChip label={`-${stats.gastados.toLocaleString()} spent`} accent="negative" />
        )}
        <StatChip label={`Balance: ${stats.balance.toLocaleString()}`} outline />
        {stats.avg > 0 && <StatChip label={`Avg: ${stats.avg} pts`} />}
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
            aria-label="Search history"
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
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setFilterType(opt.value)}
              aria-pressed={filterType === opt.value}
              className={cn(
                "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
                filterType === opt.value
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
                setFilterType("all")
                setSortMode("date-desc")
              }}
              className="text-[12px] text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
          <span className="shrink-0 text-[12px] text-muted-foreground">
            {filtered.length}/{historial.length}
          </span>
        </div>
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-sm border border-dashed border-border p-6">
          <p className="text-[13px] text-muted-foreground">No results match your filters.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((item) => {
            const cambio = getCambio(item)
            const isPositive = cambio > 0
            const EventIcon = getEventIcon(item)
            const title = getEventTitle(item)
            return (
              <div
                key={item.id}
                className="flex gap-3 rounded-sm border border-border bg-secondary p-3 transition-colors hover:border-gold/50"
              >
                {/* Icon */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-sm bg-muted">
                  <EventIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                </div>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
                  <span className="truncate text-[14px] font-medium text-foreground">{title}</span>
                  <div className="flex items-center gap-1 text-[12px] text-muted-foreground">
                    <Calendar className="size-3" aria-hidden="true" />
                    {formatDate(item.fecha)}
                  </div>
                </div>

                {/* Change + balance */}
                <div className="flex shrink-0 flex-col items-end justify-center gap-0.5">
                  <div
                    className={cn(
                      "flex items-center gap-1 text-[15px] font-semibold",
                      isPositive ? "text-foreground" : "text-destructive",
                    )}
                  >
                    {isPositive ? (
                      <TrendingUp className="size-3.5" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="size-3.5" aria-hidden="true" />
                    )}
                    {isPositive ? "+" : ""}
                    {cambio.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    Bal: {item.saldo_actual.toLocaleString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatChip({
  label,
  accent,
  outline,
}: Readonly<{
  label: string
  accent?: "positive" | "negative"
  outline?: boolean
}>) {
  let chipClass = "bg-secondary text-muted-foreground"
  if (outline) chipClass = "border border-border text-foreground"
  else if (accent === "positive") chipClass = "bg-foreground/10 text-foreground"
  else if (accent === "negative") chipClass = "bg-destructive/10 text-destructive"

  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full px-3 text-[12px] font-medium",
        chipClass,
      )}
    >
      {label}
    </span>
  )
}
