"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  Pencil,
  Tag,
  CheckCircle2,
  Clock,
  XCircle,
  Pause,
  CalendarClock,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  Percent,
  Gift,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { downloadCSV } from "@/lib/admin-csv"
import { PAGE_SIZE_OPTIONS, formatDate, getDateRangeStart } from "@/lib/admin-utils"
import type { DatePreset } from "@/lib/admin-utils"
import { StatCard } from "@/components/admin/shared/stat-card"
import { FilterPills } from "@/components/admin/shared/filter-pills"
import { SortHeader } from "@/components/admin/shared/sort-header"
import { SearchInput, CsvButton } from "@/components/admin/shared/list-toolbar"
import { Pagination } from "@/components/admin/shared/pagination"
import { deletePromocion, fetchPromocionEstadisticas } from "@/app/shop/admin/promociones/actions"
import type { Promocion, PromocionEstadisticas } from "@/types"

// ─── Types ───

type EstadoFilter = "all" | "activo" | "programado" | "expirado" | "inactivo" | "pausado"
type SortKey = "nombre" | "descuento" | "inicio" | "fin" | "estado" | "usos"
type SortDir = "asc" | "desc"

// ─── Constants ───

const ESTADO_OPTIONS: { value: EstadoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "activo", label: "Active" },
  { value: "programado", label: "Scheduled" },
  { value: "expirado", label: "Expired" },
  { value: "inactivo", label: "Inactive" },
  { value: "pausado", label: "Paused" },
]

const ESTADO_STYLES: Record<string, { icon: typeof Clock; className: string; label: string }> = {
  activo: { icon: CheckCircle2, className: "text-gold-bright", label: "Active" },
  programado: { icon: CalendarClock, className: "text-foreground", label: "Scheduled" },
  expirado: { icon: XCircle, className: "text-destructive", label: "Expired" },
  inactivo: { icon: XCircle, className: "text-muted-foreground", label: "Inactive" },
  pausado: { icon: Pause, className: "text-muted-foreground", label: "Paused" },
}

const COLUMNS: { key: SortKey; label: string; className: string }[] = [
  { key: "nombre", label: "Name", className: "min-w-0 flex-1" },
  { key: "descuento", label: "Discount", className: "w-24 shrink-0 text-right" },
  { key: "inicio", label: "Start", className: "hidden w-28 shrink-0 sm:block" },
  { key: "fin", label: "End", className: "hidden w-28 shrink-0 sm:block" },
  { key: "usos", label: "Uses", className: "w-20 shrink-0 text-right" },
  { key: "estado", label: "Status", className: "w-24 shrink-0" },
]

// ─── Helpers ───

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

function discountLabel(p: Promocion): string {
  switch (p.tipo_descuento) {
    case "porcentaje": return `${p.valor_descuento}%`
    case "fijo": return `${p.valor_descuento} pts`
    case "2x1": return "2x1"
    case "3x2": return "3x2"
    default: return String(p.valor_descuento)
  }
}

function isCurrentlyActive(p: Promocion): boolean {
  const now = Date.now()
  const start = new Date(p.fecha_inicio).getTime()
  const end = new Date(p.fecha_fin).getTime()
  return p.estado === "activo" && now >= start && now <= end
}

function isUpcoming(p: Promocion): boolean {
  const now = Date.now()
  const start = new Date(p.fecha_inicio).getTime()
  return p.estado === "programado" || (p.estado === "activo" && now < start)
}

function usagePercent(p: Promocion): number | null {
  if (!p.cantidad_usos_maximos) return null
  if (p.cantidad_usos_maximos <= 0) return null
  return Math.min(100, Math.round((p.cantidad_usos_actuales / p.cantidad_usos_maximos) * 100))
}

function getDateRange(preset: DatePreset): { start: number | null } {
  return { start: getDateRangeStart(preset) }
}

/** Generate CSV from promotions array and trigger download. */
function exportCSV(promociones: Promocion[]): void {
  const headers = [
    "ID", "Name", "Title", "Code", "Type", "Discount Type", "Value",
    "Start", "End", "Uses", "Max Uses", "Status", "Requires Code", "Priority",
  ]
  const rows = promociones.map((p) => [
    p.id,
    p.nombre,
    p.titulo,
    p.codigo ?? "",
    p.tipo,
    p.tipo_descuento,
    discountLabel(p),
    new Date(p.fecha_inicio).toISOString(),
    new Date(p.fecha_fin).toISOString(),
    p.cantidad_usos_actuales,
    p.cantidad_usos_maximos ?? "",
    p.estado,
    p.requiere_codigo ? "yes" : "no",
    p.prioridad,
  ])
  downloadCSV("promotions", headers, rows)
}

// ─── Component ───

export function AdminPromocionesList({ promociones }: Readonly<{ promociones: Promocion[] }>) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("all")
  const [datePreset, setDatePreset] = useState<DatePreset>("all")
  const [sortKey, setSortKey] = useState<SortKey>("fin")
  const [sortDir, setSortDir] = useState<SortDir>("desc")
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [pending, startTransition] = useTransition()

  // Detail drawer — stores index into filtered list for prev/next nav
  const [drawerIndex, setDrawerIndex] = useState<number | null>(null)

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = promociones.length
    const activos = promociones.filter((p) => p.estado === "activo").length
    const programados = promociones.filter((p) => p.estado === "programado").length
    const expirados = promociones.filter((p) => p.estado === "expirado").length
    const pausados = promociones.filter((p) => p.estado === "pausado" || p.estado === "inactivo").length
    return { total, activos, programados, expirados, pausados }
  }, [promociones])

  // ─── Filter + sort ───
  const filtered = useMemo(() => {
    let result = [...promociones]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (p) =>
          p.nombre.toLowerCase().includes(term) ||
          p.titulo.toLowerCase().includes(term) ||
          (p.codigo?.toLowerCase().includes(term) ?? false),
      )
    }
    if (estadoFilter !== "all") {
      result = result.filter((p) => p.estado === estadoFilter)
    }
    const { start } = getDateRange(datePreset)
    if (start !== null) {
      result = result.filter((p) => new Date(p.fecha_fin).getTime() >= start)
    }
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "nombre": cmp = (a.titulo || a.nombre).localeCompare(b.titulo || b.nombre); break
        case "descuento": cmp = a.valor_descuento - b.valor_descuento; break
        case "inicio": cmp = new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime(); break
        case "fin": cmp = new Date(a.fecha_fin).getTime() - new Date(b.fecha_fin).getTime(); break
        case "estado": cmp = a.estado.localeCompare(b.estado); break
        case "usos": cmp = a.cantidad_usos_actuales - b.cantidad_usos_actuales; break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [promociones, search, estadoFilter, datePreset, sortKey, sortDir])

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

  // ─── Actions ───
  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete promotion "${name}"? This is a soft delete.`)) return
    startTransition(async () => {
      await deletePromocion(String(id))
    })
  }

  // Reset page when filters change
  const onSearchChange = (v: string) => { setSearch(v); setCurrentPage(1) }
  const onEstadoChange = (v: EstadoFilter) => { setEstadoFilter(v); setCurrentPage(1) }
  const onDateChange = (v: DatePreset) => { setDatePreset(v); setCurrentPage(1) }
  const onPageSizeChange = (s: (typeof PAGE_SIZE_OPTIONS)[number]) => { setPageSize(s); setCurrentPage(1) }

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
            <h1 className="text-[15px] font-medium text-foreground">Promotions</h1>
            <span className="text-[13px] text-muted-foreground">
              {filtered.length} of {promociones.length}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder="Search name, code..."
              ariaLabel="Search promotions"
              widthClassName="w-44 focus:w-56"
            />
            <CsvButton onClick={() => exportCSV(filtered)} />
            <button
              type="button"
              onClick={() => router.push("/shop/admin/promociones/new")}
              className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
            >
              <Plus className="size-3.5" />
              New promotion
            </button>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={<Tag className="size-3.5" />} label="Total" value={stats.total} />
          <StatCard icon={<CheckCircle2 className="size-3.5" />} label="Active" value={stats.activos} valueClass="text-gold-bright" />
          <StatCard icon={<CalendarClock className="size-3.5" />} label="Scheduled" value={stats.programados} valueClass="text-foreground" />
          <StatCard icon={<XCircle className="size-3.5" />} label="Expired" value={stats.expirados} valueClass="text-destructive" />
          <StatCard icon={<Pause className="size-3.5" />} label="Paused/Inactive" value={stats.pausados} valueClass="text-muted-foreground" />
        </div>

        {/* Filters row: estado pills + date range */}
        <FilterPills
          options={ESTADO_OPTIONS}
          value={estadoFilter}
          onChange={onEstadoChange}
          datePreset={datePreset}
          onDateChange={onDateChange}
          dateAriaLabel="Date range (by end date)"
        />

        {/* Table */}
        {paginated.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            {/* Column headers */}
            <SortHeader
              columns={COLUMNS.map((c) => ({ ...c, alignRight: c.key === "descuento" || c.key === "usos" }))}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
              leadingLabel="ID"
              trailingLabel="Actions"
            />

            {/* Rows */}
            <div className="flex flex-col">
              {paginated.map((p) => {
                const estado = ESTADO_STYLES[p.estado] ?? ESTADO_STYLES.inactivo
                const EstadoIcon = estado.icon
                const usage = usagePercent(p)
                const active = isCurrentlyActive(p)
                const upcoming = isUpcoming(p)
                let usageBarColor = "bg-foreground"
                if (usage >= 90) usageBarColor = "bg-destructive"
                else if (usage >= 70) usageBarColor = "bg-gold-bright"

                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    className="flex cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30"
                    onClick={() => setDrawerIndex(filtered.indexOf(p))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerIndex(filtered.indexOf(p)) } }}
                  >
                    {/* ID */}
                    <span className="w-8 shrink-0 text-[13px] tabular-nums text-muted-foreground">
                      #{p.id}
                    </span>

                    {/* Name + code */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[14px] font-medium text-foreground">
                          {p.titulo || p.nombre}
                        </span>
                        {active && (
                          <span className="shrink-0 rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold-bright">
                            LIVE
                          </span>
                        )}
                        {upcoming && (
                          <span className="shrink-0 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[9px] font-bold text-foreground">
                            SOON
                          </span>
                        )}
                      </div>
                      {p.codigo && (
                        <p className="truncate font-mono text-[12px] text-muted-foreground">{p.codigo}</p>
                      )}
                    </div>

                    {/* Discount */}
                    <span className="w-24 shrink-0 text-right text-[13px] font-medium text-gold-bright">
                      {discountLabel(p)}
                    </span>

                    {/* Start */}
                    <span className="hidden w-28 shrink-0 text-[12px] text-muted-foreground sm:block">
                      {formatDate(p.fecha_inicio)}
                    </span>

                    {/* End */}
                    <span className="hidden w-28 shrink-0 text-[12px] text-muted-foreground sm:block">
                      {formatDate(p.fecha_fin)}
                    </span>

                    {/* Uses */}
                    <div className="flex w-20 shrink-0 flex-col items-end">
                      <span className="text-[13px] tabular-nums font-medium text-foreground">
                        {p.cantidad_usos_actuales.toLocaleString()}
                      </span>
                      {p.cantidad_usos_maximos && (
                        <span className="text-[10px] text-muted-foreground">
                          / {p.cantidad_usos_maximos.toLocaleString()}
                        </span>
                      )}
                      {usage !== null && (
                        <div className="mt-0.5 h-1 w-12 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              usageBarColor,
                            )}
                            style={{ width: `${usage}%` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className={cn("flex w-24 shrink-0 items-center gap-1 text-[12px] font-medium", estado.className)}>
                      <EstadoIcon className="size-3 shrink-0" aria-hidden="true" />
                      {estado.label}
                    </div>

                    {/* Actions */}
                    <div role="button" tabIndex={0} className="flex w-24 shrink-0 items-center justify-end gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => router.push(`/shop/admin/promociones/${p.id}/edit`)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label="Edit"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id, p.titulo || p.nombre)}
                        disabled={pending}
                        className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                        aria-label="Delete"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
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
            <div className="flex flex-col items-center gap-3">
              <p className="text-[13px] text-muted-foreground">
                {search.trim() ? `No results match "${search.trim()}".` : "No promotions yet."}
              </p>
              {!search.trim() && (
                <button
                  type="button"
                  onClick={() => router.push("/shop/admin/promociones/new")}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
                >
                  <Plus className="size-3.5" />
                  Create your first promotion
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Detail drawer (outside the shifting div so fixed positioning
          is relative to the viewport, not the transformed parent) ─── */}
      {drawerIndex !== null && drawerIndex >= 0 && drawerIndex < filtered.length && (
        <DetailDrawer
          promociones={filtered}
          index={drawerIndex}
          onClose={() => setDrawerIndex(null)}
          onNavigate={(nextIndex) => setDrawerIndex(nextIndex)}
          onEdit={(id) => router.push(`/shop/admin/promociones/${id}/edit`)}
        />
      )}
    </>
  )
}

// ─── Detail drawer ───

function DetailDrawer({
  promociones,
  index,
  onClose,
  onNavigate,
  onEdit,
}: Readonly<{
  promociones: Promocion[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
  onEdit: (id: number) => void
}>) {
  const promocion = promociones[index]
  const [estadisticas, setEstadisticas] = useState<PromocionEstadisticas | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)

  // Reset stats state when promotion changes — "adjust state during render"
  // pattern from React docs (avoids setState-in-effect lint violation).
  const [prevPromoId, setPrevPromoId] = useState(promocion.id)
  if (promocion.id !== prevPromoId) {
    setPrevPromoId(promocion.id)
    setEstadisticas(null)
    setLoadingStats(true)
    setStatsError(null)
  }

  const estado = ESTADO_STYLES[promocion.estado] ?? ESTADO_STYLES.inactivo
  const EstadoIcon = estado.icon
  const usage = usagePercent(promocion)
  const active = isCurrentlyActive(promocion)
  const usageValue = usage ?? 0
  let usageBarColor = "bg-foreground"
  if (usageValue >= 90) usageBarColor = "bg-destructive"
  else if (usageValue >= 70) usageBarColor = "bg-gold-bright"

  // Fetch statistics when promotion changes
  useEffect(() => {
    let cancelled = false
    fetchPromocionEstadisticas(String(promocion.id))
      .then((result) => {
        if (!cancelled) {
          if (result.error) {
            setStatsError(result.error)
          } else {
            setEstadisticas(result.data ?? null)
          }
          setLoadingStats(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStatsError("Failed to load statistics")
          setLoadingStats(false)
        }
      })
    return () => { cancelled = true }
  }, [promocion.id])

  // Keyboard: Escape to close, arrows to navigate
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < promociones.length - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [index, promociones.length, onClose, onNavigate])

  const maxUsesSuffix = promocion.cantidad_usos_maximos
    ? ` / ${promocion.cantidad_usos_maximos.toLocaleString()}`
    : ""
  const statRows = [
    { label: "Status", value: estado.label },
    { label: "Discount", value: discountLabel(promocion) },
    { label: "Type", value: promocion.tipo },
    { label: "Discount type", value: promocion.tipo_descuento },
    { label: "Start", value: formatDateLong(promocion.fecha_inicio) },
    { label: "End", value: formatDateLong(promocion.fecha_fin) },
    { label: "Uses", value: `${promocion.cantidad_usos_actuales.toLocaleString()}${maxUsesSuffix}` },
    { label: "Uses per user", value: String(promocion.usos_por_usuario) },
    { label: "Min points", value: `${promocion.minimo_puntos.toLocaleString()} pts` },
    { label: "Priority", value: String(promocion.prioridad) },
    { label: "Requires code", value: promocion.requiere_codigo ? "Yes" : "No" },
    { label: "Accumulation", value: promocion.aplica_acumulacion ? "Allowed" : "Not allowed" },
  ]

  return (
    <>
      {/* Static metadata sidebar */}
      <aside
        aria-label={`Promotion #${promocion.id}`}
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
              aria-label="Previous promotion"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <span className="text-[12px] tabular-nums text-muted-foreground">
              {index + 1} / {promociones.length}
            </span>
            <button
              type="button"
              onClick={() => index < promociones.length - 1 && onNavigate(index + 1)}
              disabled={index === promociones.length - 1}
              aria-label="Next promotion"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6 lg:px-5">
          {/* Title + status */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tabular-nums text-muted-foreground">#{promocion.id}</span>
              <div className={cn("flex items-center gap-1 text-[12px] font-medium", estado.className)}>
                <EstadoIcon className="size-3" aria-hidden="true" />
                {estado.label}
              </div>
              {active && (
                <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold-bright">
                  LIVE
                </span>
              )}
            </div>
            <h2 className="text-[18px] font-semibold leading-tight text-foreground">
              {promocion.titulo || promocion.nombre}
            </h2>
            {promocion.codigo && (
              <p className="font-mono text-[13px] text-muted-foreground">
                Code: {promocion.codigo}
              </p>
            )}
            {promocion.descripcion && (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {promocion.descripcion}
              </p>
            )}
          </div>

          {/* Usage progress bar */}
          {promocion.cantidad_usos_maximos && (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-muted-foreground">Usage</span>
                <span className="font-medium text-foreground">
                  {promocion.cantidad_usos_actuales.toLocaleString()} / {promocion.cantidad_usos_maximos.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    usageBarColor,
                  )}
                  style={{ width: `${usage ?? 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Key-value stats */}
          <div className="flex flex-col gap-0">
            <span className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Details
            </span>
            {statRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 py-1.5 last:border-b-0">
                <span className="text-[12px] text-muted-foreground">{row.label}</span>
                <span className="text-right text-[13px] font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>

          {/* Statistics from backend */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Usage statistics
            </span>
            {loadingStats && (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Clock className="size-3 animate-spin" aria-hidden="true" />
                Loading statistics...
              </div>
            )}
            {statsError && (
              <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-[12px] text-destructive">
                {statsError}
              </div>
            )}
            {estadisticas && !loadingStats && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <StatMini icon={<TrendingUp className="size-3" />} label="Total uses" value={estadisticas.estadisticas.total_usos} />
                  <StatMini icon={<Users className="size-3" />} label="Unique users" value={estadisticas.estadisticas.usuarios_unicos} />
                  <StatMini icon={<Percent className="size-3" />} label="Avg discount" value={estadisticas.estadisticas.descuento_promedio} />
                  <StatMini icon={<Gift className="size-3" />} label="Points saved" value={estadisticas.estadisticas.puntos_descontados_total} />
                </div>

                {/* Top users */}
                {estadisticas.topUsuarios.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Top users</span>
                    {estadisticas.topUsuarios.slice(0, 5).map((u) => (
                      <div key={u.usuario_id} className="flex items-center justify-between text-[12px]">
                        <span className="truncate text-foreground">{u.Usuario?.username ?? `User #${u.usuario_id}`}</span>
                        <span className="shrink-0 text-muted-foreground">{u.usos} uses</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Top products */}
                {estadisticas.topProductos.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-muted-foreground">Top products</span>
                    {estadisticas.topProductos.slice(0, 5).map((p) => (
                      <div key={p.producto_id} className="flex items-center justify-between text-[12px]">
                        <span className="truncate text-foreground">{p.Producto?.nombre ?? `Product #${p.producto_id}`}</span>
                        <span className="shrink-0 text-muted-foreground">{p.canjes} redemptions</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Products linked to this promotion */}
          {promocion.productos && promocion.productos.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Linked products ({promocion.productos.length})
              </span>
              {promocion.productos.slice(0, 10).map((prod) => (
                <div key={prod.id} className="flex items-center gap-2 text-[12px]">
                  <div className="size-6 shrink-0 overflow-hidden rounded-sm bg-muted">
                    {(prod.imagen || prod.imagen_url) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.imagen ?? prod.imagen_url} alt={prod.nombre} className="size-full object-cover" />
                    )}
                  </div>
                  <span className="truncate text-foreground">{prod.nombre}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">{prod.precio.toLocaleString()} pts</span>
                </div>
              ))}
              {promocion.productos.length > 10 && (
                <span className="text-[11px] text-muted-foreground">
                  + {promocion.productos.length - 10} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer — edit button */}
        <div className="shrink-0 border-t border-border px-4 py-3 lg:px-5">
          <button
            type="button"
            onClick={() => onEdit(promocion.id)}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-full bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-85"
          >
            <Pencil className="size-3.5" />
            Edit promotion
          </button>
        </div>
      </aside>

      {/* Click-outside backdrop */}
      <div
        className="fixed inset-0 z-10 bg-black/40 lg:left-[max(252px,calc(50vw-588px)+292px)]"
        onClick={onClose}
        aria-hidden="true"
      />
    </>
  )
}

// ─── Sub-components ───

function StatMini({
  icon,
  label,
  value,
}: Readonly<{
  icon: React.ReactNode
  label: string
  value: number
}>) {
  return (
    <div className="flex flex-col gap-1 rounded-sm border border-border bg-secondary p-2.5">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className="text-[16px] font-bold tabular-nums text-foreground">
        {value.toLocaleString()}
      </span>
    </div>
  )
}
