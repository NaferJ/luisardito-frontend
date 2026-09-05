"use client"

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShoppingBag,
  Crown,
  Star,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
  CheckSquare,
  Square,
} from "lucide-react"
import { cn, formatCompactNumber } from "@/lib/utils"
import { VipBadge } from "@/components/vip-badge"
import { downloadCSV } from "@/lib/admin-csv"
import { PAGE_SIZE_OPTIONS, getDateRangeStart } from "@/lib/admin-utils"
import type { DatePreset } from "@/lib/admin-utils"
import { StatCard } from "@/components/admin/shared/stat-card"
import { FilterPills } from "@/components/admin/shared/filter-pills"
import { SearchInput, CsvButton } from "@/components/admin/shared/list-toolbar"
import { Pagination } from "@/components/admin/shared/pagination"
import { DiscordLogo } from "@/components/brand-icons"
import { CANJES_STATUS_CHANGED } from "@/components/pending-canjes-badge"
import { updateCanjeEstado, devolverCanje } from "@/app/shop/admin/canjes/actions"
import type { Canje, Usuario } from "@/types"

// ─── Types ───

type StatusFilter = "all" | "pendiente" | "entregado" | "cancelado" | "devuelto"
type SortKey = "id" | "usuario" | "producto" | "fecha" | "precio"
type SortDir = "asc" | "desc"

// ─── Constants ───

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

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "usuario", label: "User", className: "min-w-0 flex-1" },
  { key: "producto", label: "Product", className: "min-w-0 flex-1" },
  { key: "fecha", label: "Date", className: "w-32 shrink-0" },
  { key: "precio", label: "Points", className: "w-24 shrink-0 text-right" },
]

const POLL_INTERVAL = 30_000 // 30 seconds

// ─── Helpers ───

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

function formatDateLong(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

function canjeUser(c: Canje): string {
  const u = c.Usuario ?? c.usuario
  if (!u) return `User #${c.usuario_id}`
  return u.kick_data?.username ?? u.nickname ?? u.display_name ?? u.nombre ?? u.email
}

function canjeUserAvatar(c: Canje): string | undefined {
  const u = c.Usuario ?? c.usuario
  if (!u) return undefined
  return u.kick_data?.avatar_url ?? u.kick_avatar ?? u.avatar_url ?? undefined
}

function canjeProduct(c: Canje): string {
  return c.Producto?.nombre ?? c.producto?.nombre ?? "Product unavailable"
}

function canjeProductImage(c: Canje): string | undefined {
  return c.Producto?.imagen ?? c.Producto?.imagen_url ?? c.producto?.imagen ?? c.producto?.imagen_url ?? undefined
}

function canjeProductDesc(c: Canje): string | undefined {
  return c.Producto?.descripcion ?? c.producto?.descripcion ?? undefined
}

function canjePrice(c: Canje): number {
  return c.precio_al_canje ?? c.Producto?.precio ?? c.producto?.precio ?? 0
}

function canjeCurrentPrice(c: Canje): number | undefined {
  const currentPrecio = c.Producto?.precio ?? c.producto?.precio
  if (c.precio_al_canje != null && currentPrecio != null && c.precio_al_canje !== currentPrecio) {
    return currentPrecio
  }
  return undefined
}

function isVip(u?: Usuario): boolean {
  return Boolean(u?.vip_status?.is_active ?? u?.vip_info?.is_active ?? u?.is_vip ?? false)
}

function isSub(u?: Usuario): boolean {
  return u?.subscriber_status?.is_active ?? false
}

function isAdmin(u?: Usuario): boolean {
  return u ? [3, 4, 5].includes(u.rol_id) : false
}

function hasDiscord(u?: Usuario): boolean {
  return u?.discord_info?.linked ?? u?.discordLinked ?? false
}

function discordName(u?: Usuario): string | undefined {
  return u?.discord_info?.display_name ?? u?.discord_info?.username ?? u?.discordUsername ?? undefined
}

function getDateRange(preset: DatePreset): { start: number | null } {
  return { start: getDateRangeStart(preset) }
}

/** Generate CSV from canjes array and trigger download. */
function exportCSV(canjes: Canje[]): void {
  const headers = ["ID", "User", "Discord", "Email", "Product", "Price", "Status", "Date"]
  const rows = canjes.map((c) => {
    const u = c.Usuario ?? c.usuario
    return [
      c.id,
      canjeUser(c),
      discordName(u) ?? "Not linked",
      u?.email ?? "",
      canjeProduct(c),
      canjePrice(c),
      c.estado,
      new Date(c.fecha).toISOString(),
    ]
  })
  downloadCSV("redemptions", headers, rows)
}

// ─── Component ───

function SortIcon({
  column,
  sortKey,
  sortDir,
}: Readonly<{ column: SortKey; sortKey: SortKey; sortDir: SortDir }>) {
  if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-30" />
  return sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
}

export function AdminCanjesList({ canjes: initialCanjes }: Readonly<{ canjes: Canje[] }>) {
  const router = useRouter()
  const [canjes, setCanjes] = useState<Canje[]>(initialCanjes)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [sortKey, setSortKey] = useState<SortKey>("fecha")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [pending, startTransition] = useTransition()

  // Detail drawer — stores index into filtered list for prev/next nav
  const [drawerIndex, setDrawerIndex] = useState<number | null>(null)

  // Return modal
  const [returnTarget, setReturnTarget] = useState<Canje | null>(null)
  const [returnMotivo, setReturnMotivo] = useState("")
  const [returnError, setReturnError] = useState<string | null>(null)

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Polling
  const [isPolling, setIsPolling] = useState(false)
  const lastPollRef = useRef<number>(0)

  // ─── Real-time polling ───
  useEffect(() => {
    const poll = async () => {
      setIsPolling(true)
      try {
        const res = await fetch("/shop/api/canjes/pending-count", { cache: "no-store" })
        if (res.ok) {
          // Refresh server data to get latest redemptions
          router.refresh()
          lastPollRef.current = Date.now()
        }
      } catch {
        // Silent fail
      } finally {
        setIsPolling(false)
      }
    }

    const interval = setInterval(poll, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [router])

  // Sync with server-refreshed data using the "adjust state during render"
  // pattern from React docs (avoids setState-in-effect lint violation).
  const [prevInitialCanjes, setPrevInitialCanjes] = useState(initialCanjes)
  if (initialCanjes !== prevInitialCanjes) {
    setPrevInitialCanjes(initialCanjes)
    setCanjes(initialCanjes)
  }

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = canjes.length
    const pendientes = canjes.filter((c) => c.estado === "pendiente").length
    const entregados = canjes.filter((c) => c.estado === "entregado").length
    const cancelados = canjes.filter((c) => c.estado === "cancelado").length
    const devueltos = canjes.filter((c) => c.estado === "devuelto").length
    return { total, pendientes, entregados, cancelados, devueltos }
  }, [canjes])

  // ─── Filter + sort ───
  const filtered = useMemo(() => {
    let result = [...canjes]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          canjeUser(c).toLowerCase().includes(term) ||
          canjeProduct(c).toLowerCase().includes(term) ||
          String(c.id).includes(term) ||
          (discordName(c.Usuario ?? c.usuario)?.toLowerCase().includes(term) ?? false),
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.estado === statusFilter)
    }
    const { start } = getDateRange(datePreset)
    if (start !== null) {
      result = result.filter((c) => new Date(c.fecha).getTime() >= start)
    }
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "id": cmp = a.id - b.id; break
        case "usuario": cmp = canjeUser(a).localeCompare(canjeUser(b)); break
        case "producto": cmp = canjeProduct(a).localeCompare(canjeProduct(b)); break
        case "fecha": cmp = new Date(a.fecha).getTime() - new Date(b.fecha).getTime(); break
        case "precio": cmp = canjePrice(a) - canjePrice(b); break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [canjes, search, statusFilter, datePreset, sortKey, sortDir])

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  // ─── Optimistic update helper ───
  const optimisticUpdate = useCallback((id: number, estado: Canje["estado"]) => {
    setCanjes((prev) =>
      prev.map((c) => (c.id === id ? { ...c, estado } : c)),
    )
  }, [])

  // ─── Actions ───
  const handleUpdate = (id: number, estado: "pendiente" | "entregado" | "cancelado") => {
    // Optimistic update
    optimisticUpdate(id, estado)
    window.dispatchEvent(new Event(CANJES_STATUS_CHANGED))
    startTransition(async () => {
      const result = await updateCanjeEstado(String(id), estado)
      if (result.error) {
        // Revert on error — refresh from server
        router.refresh()
      }
    })
  }

  const handleBulkUpdate = (estado: "entregado" | "cancelado") => {
    const targets = filtered.filter((c) => selectedIds.has(c.id) && c.estado === "pendiente")
    if (targets.length === 0) return

    // Optimistic update all
    targets.forEach((t) => optimisticUpdate(t.id, estado))
    window.dispatchEvent(new Event(CANJES_STATUS_CHANGED))

    startTransition(async () => {
      let hadError = false
      for (const t of targets) {
        const result = await updateCanjeEstado(String(t.id), estado)
        if (result.error) hadError = true
      }
      if (hadError) router.refresh()
      setSelectedIds(new Set())
    })
  }

  const openReturnModal = (canje: Canje) => {
    setReturnTarget(canje)
    setReturnMotivo("")
    setReturnError(null)
  }

  const closeReturnModal = () => {
    setReturnTarget(null)
    setReturnMotivo("")
    setReturnError(null)
  }

  const handleConfirmReturn = () => {
    if (!returnTarget) return
    if (!returnMotivo.trim()) {
      setReturnError("Please provide a reason for the return.")
      return
    }
    const target = returnTarget
    // Optimistic update
    optimisticUpdate(target.id, "devuelto")
    window.dispatchEvent(new Event(CANJES_STATUS_CHANGED))
    closeReturnModal()
    startTransition(async () => {
      const result = await devolverCanje(String(target.id), returnMotivo.trim())
      if (result.error) {
        router.refresh()
      }
    })
  }

  // ─── Bulk selection ───
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectPage = () => {
    const pageIds = paginated.map((c) => c.id)
    const allSelected = pageIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id))
      } else {
        pageIds.forEach((id) => next.add(id))
      }
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  // Reset page when filters change
  const onSearchChange = (v: string) => { setSearch(v); setCurrentPage(1) }
  const onStatusChange = (v: StatusFilter) => { setStatusFilter(v); setCurrentPage(1) }
  const onDateChange = (v: DatePreset) => { setDatePreset(v); setCurrentPage(1) }
  const onPageSizeChange = (s: (typeof PAGE_SIZE_OPTIONS)[number]) => { setPageSize(s); setCurrentPage(1) }

  const selectedPendingCount = filtered.filter((c) => selectedIds.has(c.id) && c.estado === "pendiente").length

  return (
    <>
    <div
      className={cn(
        "flex flex-col gap-6 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        drawerIndex !== null && "lg:translate-x-[292px]",
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Redemptions</h1>
          <span className="text-[13px] text-muted-foreground">
            {filtered.length} of {canjes.length}
          </span>
          {isPolling && (
            <RefreshCw className="size-3 animate-spin text-muted-foreground" aria-label="Syncing" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Search user, product, ID..."
            ariaLabel="Search redemptions"
          />
          <CsvButton onClick={() => exportCSV(filtered)} />
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon={<ShoppingBag className="size-3.5" />} label="Total" value={stats.total} />
        <StatCard icon={<Clock className="size-3.5" />} label="Pending" value={stats.pendientes} valueClass="text-gold-bright" />
        <StatCard icon={<CheckCircle2 className="size-3.5" />} label="Delivered" value={stats.entregados} valueClass="text-foreground" />
        <StatCard icon={<XCircle className="size-3.5" />} label="Cancelled" value={stats.cancelados} valueClass="text-destructive" />
        <StatCard icon={<RotateCcw className="size-3.5" />} label="Returned" value={stats.devueltos} valueClass="text-muted-foreground" />
      </div>

      {/* Filters row: status pills + date range */}
      <FilterPills
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={onStatusChange}
        datePreset={datePreset}
        onDateChange={onDateChange}
        dateAriaLabel="Date range"
      />

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-sm border border-gold/40 bg-gold/5 px-4 py-2.5">
          <span className="text-[13px] font-medium text-foreground">
            {selectedIds.size} selected
            {selectedPendingCount > 0 && ` · ${selectedPendingCount} pending`}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkUpdate("entregado")}
              disabled={pending || selectedPendingCount === 0}
              className="flex h-7 items-center gap-1.5 rounded-full bg-gold px-3 text-[12px] font-medium text-gold-foreground transition-opacity hover:opacity-85 disabled:opacity-50"
            >
              <CheckCircle2 className="size-3" />
              Deliver all
            </button>
            <button
              type="button"
              onClick={() => handleBulkUpdate("cancelado")}
              disabled={pending || selectedPendingCount === 0}
              className="flex h-7 items-center gap-1.5 rounded-full border border-destructive/40 px-3 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              <XCircle className="size-3" />
              Cancel all
            </button>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="ml-auto text-[12px] text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Table */}
      {paginated.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Column headers */}
          <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5">
            {/* Bulk select checkbox */}
            <button
              type="button"
              onClick={toggleSelectPage}
              className="flex w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={paginated.every((c) => selectedIds.has(c.id)) ? "Deselect page" : "Select page"}
            >
              {paginated.every((c) => selectedIds.has(c.id)) ? (
                <CheckSquare className="size-4 text-gold-bright" />
              ) : (
                <Square className="size-4" />
              )}
            </button>
            <span className="w-8 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              ID
            </span>
            {COLUMNS.map((col) => (
              <button
                key={col.key}
                type="button"
                onClick={() => toggleSort(col.key)}
                className={cn(
                  "flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
                  col.className,
                  col.key === "precio" && "justify-end",
                )}
              >
                {col.label}
                <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
              </button>
            ))}
            <span className="w-24 shrink-0 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Status
            </span>
            <span className="w-36 shrink-0 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {paginated.map((canje) => {
              const status = STATUS_STYLES[canje.estado] ?? STATUS_STYLES.pendiente
              const StatusIcon = status.icon
              const user = canje.Usuario ?? canje.usuario
              const avatar = canjeUserAvatar(canje)
              const productImg = canjeProductImage(canje)
              const currentPrice = canjeCurrentPrice(canje)
              const vip = isVip(user)
              const sub = isSub(user)
              const admin = isAdmin(user)
              const discord = hasDiscord(user)
              const dName = discordName(user)
              const isSelected = selectedIds.has(canje.id)

              return (
                <div
                  key={canje.id}
                  role="button"
                  tabIndex={0}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30",
                    isSelected && "bg-gold/5",
                  )}
                  onClick={() => setDrawerIndex(filtered.indexOf(canje))}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerIndex(filtered.indexOf(canje)) } }}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleSelect(canje.id) }}
                    className="flex w-5 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground"
                    aria-label={isSelected ? "Deselect" : "Select"}
                  >
                    {isSelected ? (
                      <CheckSquare className="size-4 text-gold-bright" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>

                  {/* ID */}
                  <span className="w-8 shrink-0 text-[13px] tabular-nums text-muted-foreground">
                    #{canje.id}
                  </span>

                  {/* User with avatar + badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                        {avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatar} alt={canjeUser(canje)} className="size-full object-cover" />
                        ) : (
                          <span className="flex size-full items-center justify-center text-[13px] font-bold text-foreground">
                            {canjeUser(canje).charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-[14px] font-medium text-foreground">
                            {canjeUser(canje)}
                          </span>
                          {vip && <Crown className="size-3 shrink-0 text-gold-bright" aria-hidden="true" />}
                          {sub && <Star className="size-3 shrink-0 text-foreground" aria-hidden="true" />}
                          {admin && (
                            <span className="shrink-0 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-gold-foreground">
                              ADM
                            </span>
                          )}
                        </div>
                        {discord && dName ? (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <DiscordLogo className="size-2.5" />
                            <span className="truncate">{dName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-[11px] text-destructive/70">
                            <AlertTriangle className="size-2.5" />
                            <span>No Discord</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Product with image */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <div className="size-9 shrink-0 overflow-hidden rounded-sm bg-secondary">
                        {productImg && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={productImg} alt={canjeProduct(canje)} className="size-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-medium text-foreground">
                          {canjeProduct(canje)}
                        </p>
                        {canjeProductDesc(canje) && (
                          <p className="truncate text-[12px] text-muted-foreground">
                            {canjeProductDesc(canje)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <span className="w-32 shrink-0 text-[12px] text-muted-foreground">
                    {formatDate(canje.fecha)}
                  </span>

                  {/* Price */}
                  <div className="flex w-24 shrink-0 flex-col items-end">
                    <span className="text-[13px] tabular-nums font-medium text-gold-bright">
                      {formatCompactNumber(canjePrice(canje))}
                    </span>
                    {currentPrice !== undefined && (
                      <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground" title={`Current price: ${formatCompactNumber(currentPrice)} pts`}>
                        <AlertTriangle className="size-2.5" />
                        now {formatCompactNumber(currentPrice)}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className={cn("flex w-24 shrink-0 items-center gap-1 text-[12px] font-medium", status.className)}>
                    <StatusIcon className="size-3 shrink-0" aria-hidden="true" />
                    {status.label}
                  </div>

                  {/* Actions */}
                  <div className="flex w-36 shrink-0 items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    {canje.estado === "pendiente" && (
                      <>
                        <ActionBtn
                          label="Deliver"
                          onClick={() => handleUpdate(canje.id, "entregado")}
                          disabled={pending}
                          primary
                        />
                        <ActionBtn
                          label="Cancel"
                          onClick={() => handleUpdate(canje.id, "cancelado")}
                          disabled={pending}
                          danger
                        />
                      </>
                    )}
                    {canje.estado === "entregado" && (
                      <ActionBtn
                        label="Return"
                        onClick={() => openReturnModal(canje)}
                        disabled={pending}
                      />
                    )}
                    {(canje.estado === "cancelado" || canje.estado === "devuelto") && (
                      <span className="text-[12px] text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={filtered.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
          <p className="text-[13px] text-muted-foreground">
            {search.trim() ? `No results match "${search.trim()}".` : "No redemptions yet."}
          </p>
        </div>
      )}
    </div>

      {/* ─── Detail drawer (outside the shifting div so fixed positioning
          is relative to the viewport, not the transformed parent) ─── */}
      {drawerIndex !== null && drawerIndex >= 0 && drawerIndex < filtered.length && (
        <DetailDrawer
          canjes={filtered}
          index={drawerIndex}
          onClose={() => setDrawerIndex(null)}
          onNavigate={(nextIndex) => setDrawerIndex(nextIndex)}
        />
      )}

      {/* ─── Return modal (also outside the shifting div) ─── */}
      {returnTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeReturnModal} onKeyDown={(e) => { if (e.key === "Escape") closeReturnModal() }}>
          <div
            className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-border bg-background p-5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[15px] font-medium text-foreground">Return redemption</span>
                <span className="text-[12px] text-muted-foreground">#{returnTarget.id}</span>
              </div>
              <button type="button" onClick={closeReturnModal} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-sm border border-border bg-secondary p-3">
              <div className="size-10 shrink-0 overflow-hidden rounded-sm bg-muted">
                {canjeProductImage(returnTarget) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={canjeProductImage(returnTarget)} alt={canjeProduct(returnTarget)} className="size-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-foreground">{canjeProduct(returnTarget)}</p>
                <p className="truncate text-[12px] text-muted-foreground">{canjeUser(returnTarget)}</p>
              </div>
              <span className="shrink-0 text-[14px] font-semibold text-gold-bright">
                {formatCompactNumber(canjePrice(returnTarget))} pts
              </span>
            </div>

            {canjeCurrentPrice(returnTarget) !== undefined && (
              <p className="text-[12px] text-muted-foreground">
                Price paid at redemption: {formatCompactNumber(canjePrice(returnTarget))} pts.
                Current product price: {formatCompactNumber(canjeCurrentPrice(returnTarget) ?? 0)} pts.
              </p>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">Reason for return</span>
              <textarea
                value={returnMotivo}
                onChange={(e) => { setReturnMotivo(e.target.value); setReturnError(null) }}
                placeholder="e.g. Delivery error, product unavailable, user request..."
                rows={3}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                autoFocus
              />
            </label>

            {returnError && (
              <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
                {returnError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeReturnModal}
                className="flex h-9 items-center rounded-full border border-border px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={pending || !returnMotivo.trim()}
                className="flex h-9 items-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" />
                {pending ? "Returning..." : "Confirm return"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Detail drawer — matches the product detail overlay design ───

function DetailDrawer({
  canjes,
  index,
  onClose,
  onNavigate,
}: Readonly<{
  canjes: Canje[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}>) {
  const canje = canjes[index]
  const user = canje.Usuario ?? canje.usuario
  const avatar = canjeUserAvatar(canje)
  const productImg = canjeProductImage(canje)
  const status = STATUS_STYLES[canje.estado] ?? STATUS_STYLES.pendiente
  const StatusIcon = status.icon
  const currentPrice = canjeCurrentPrice(canje)

  // Keyboard: Escape to close, arrows to navigate
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < canjes.length - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [index, canjes.length, onClose, onNavigate])

  const statRows = [
    { label: "Status", value: status.label },
    { label: "Price paid", value: `${formatCompactNumber(canjePrice(canje))} pts` },
    ...(currentPrice !== undefined ? [{ label: "Current price", value: `${formatCompactNumber(currentPrice)} pts` }] : []),
    { label: "Discord", value: hasDiscord(user) ? (discordName(user) ?? "Linked") : "Not linked" },
    { label: "Date", value: formatDateLong(canje.fecha) },
    ...(user ? [{ label: "User points", value: `${formatCompactNumber(user.puntos)} pts` }] : []),
  ]

  return (
    <>
      {/* Static metadata sidebar — always opaque, never animated.
          Sits at z-20 so the lightbox (z-50) and its blur layer only paint
          to the right of it. The "slide-in" illusion is created by the
          table shifting right, not by the panel itself moving. */}
      <aside
        aria-label={`Redemption #${canje.id}`}
        className="fixed inset-y-0 left-0 right-0 z-20 flex flex-col overflow-hidden bg-background lg:left-[max(252px,calc(50vw-588px))] lg:right-auto lg:w-[292px]"
      >
        {/* Header — close + prev/next */}
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => index > 0 && onNavigate(index - 1)}
              disabled={index === 0}
              aria-label="Previous redemption"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => index < canjes.length - 1 && onNavigate(index + 1)}
              disabled={index === canjes.length - 1}
              aria-label="Next redemption"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
          <div className="flex flex-col gap-6">
            {/* Product info */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">Product</span>
                <h2 className="text-[15px] font-medium text-foreground">{canjeProduct(canje)}</h2>
              </div>
              {canjeProductDesc(canje) && (
                <p className="text-[13px] leading-relaxed text-pretty text-foreground">{canjeProductDesc(canje)}</p>
              )}
            </div>

            {/* User info */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">User</span>
                <div className="flex items-center gap-2.5">
                  <div className="size-9 shrink-0 overflow-hidden rounded-full bg-muted">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt={canjeUser(canje)} className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-[13px] font-bold text-foreground">
                        {canjeUser(canje).charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[14px] font-medium text-foreground">{canjeUser(canje)}</span>
                      {isVip(user) && <VipBadge size={12} className="shrink-0" />}
                      {isSub(user) && <Star className="size-3 shrink-0 text-foreground" aria-hidden="true" />}
                      {isAdmin(user) && (
                        <span className="shrink-0 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-gold-foreground">ADM</span>
                      )}
                    </div>
                    {hasDiscord(user) && discordName(user) ? (
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <DiscordLogo className="size-2.5" />
                        <span className="truncate">{discordName(user)}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[11px] text-destructive/70">
                        <AlertTriangle className="size-2.5" />
                        <span>No Discord linked</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Stat rows — same pattern as product overlay */}
            <div className="flex flex-col">
              {statRows.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "flex items-start justify-between gap-3 py-1.5",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="shrink-0 text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-right text-[13px] text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Status indicator */}
            <div className={cn("flex items-center gap-2 text-[13px] font-medium", status.className)}>
              <StatusIcon className="size-4" aria-hidden="true" />
              {status.label}
            </div>
          </div>
        </div>
      </aside>

      {/* Lightbox: covers the overlay area but the blur + media are offset
          right by a 292px spacer so they never paint behind the sidebar.
          Only shown on lg+ when there's a product image. */}
      {productImg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={canjeProduct(canje)}
          className="fixed inset-y-0 left-0 right-0 z-50 hidden flex-row overflow-hidden pointer-events-none lg:flex lg:left-[max(252px,calc(50vw-588px))] lg:right-[120px]"
        >
          {/* Spacer — reserves the sidebar area so blur/media don't paint there */}
          <div className="hidden lg:block lg:w-[292px] lg:shrink-0" />

          {/* Media + blur area. Blur lives on its own static layer so it always
              paints correctly; only the image content fades + scales in on top. */}
          <div className="relative flex min-w-0 flex-1 items-center justify-center">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-background/70 backdrop-blur-[8px]"
            />
            <div className="overlay-media relative w-full max-w-2xl overflow-hidden rounded-sm bg-card shadow-2xl ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={productImg} alt={canjeProduct(canje)} className="w-full object-cover" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Sub-components ───

function ActionBtn({
  label,
  onClick,
  disabled,
  primary,
  danger,
}: Readonly<{
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
  danger?: boolean
}>) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-6 rounded-full px-2.5 text-[11px] font-medium transition-colors disabled:opacity-50",
        primary && "bg-gold text-gold-foreground hover:opacity-85",
        danger && "border border-destructive/40 text-destructive hover:bg-destructive/10",
        !primary && !danger && "border border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
