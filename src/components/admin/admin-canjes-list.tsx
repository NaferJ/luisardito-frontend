"use client"

import { useMemo, useState, useTransition } from "react"
import { Search, Clock, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { updateCanjeEstado, devolverCanje } from "@/app/shop/admin/canjes/actions"
import type { Canje } from "@/types"

type StatusFilter = "all" | "pendiente" | "entregado" | "cancelado" | "devuelto"

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

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

function canjeUser(c: Canje): string {
  return c.usuario?.nickname ?? c.usuario?.kick_data?.username ?? c.usuario?.email ?? `User ${c.usuario_id}`
}

function canjeProduct(c: Canje): string {
  return c.producto?.nombre ?? "Product unavailable"
}

function canjePrice(c: Canje): number {
  return c.precio_al_canje ?? c.producto?.precio ?? 0
}

export function AdminCanjesList({ canjes }: { canjes: Canje[] }) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [pending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    let result = [...canjes]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          canjeUser(c).toLowerCase().includes(term) ||
          canjeProduct(c).toLowerCase().includes(term) ||
          String(c.id).includes(term),
      )
    }
    if (statusFilter !== "all") {
      result = result.filter((c) => c.estado === statusFilter)
    }
    result.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    return result
  }, [canjes, search, statusFilter])

  const handleUpdate = (id: string, estado: "pendiente" | "entregado" | "cancelado" | "devuelto") => {
    startTransition(async () => {
      if (estado === "devuelto") {
        await devolverCanje(id)
      } else {
        await updateCanjeEstado(id, estado)
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Redemptions</h1>
          <span className="text-[13px] text-muted-foreground">
            {filtered.length} of {canjes.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex h-8 items-center">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              aria-label="Search redemptions"
              className="h-8 w-44 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-56 focus:border-gold focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Status filter pills */}
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
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          {/* Header */}
          <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="w-12 shrink-0">ID</span>
            <span className="min-w-0 flex-1">Product</span>
            <span className="hidden w-32 shrink-0 sm:block">User</span>
            <span className="w-20 shrink-0 text-right">Price</span>
            <span className="hidden w-32 shrink-0 md:block">Date</span>
            <span className="w-28 shrink-0">Status</span>
            <span className="w-40 shrink-0 text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {filtered.map((canje) => {
              const status = STATUS_STYLES[canje.estado] ?? STATUS_STYLES.pendiente
              const StatusIcon = status.icon
              return (
                <div
                  key={canje.id}
                  className="flex items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30"
                >
                  <span className="w-12 shrink-0 text-[13px] tabular-nums text-muted-foreground">
                    #{canje.id}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">
                    {canjeProduct(canje)}
                  </span>
                  <span className="hidden w-32 shrink-0 truncate text-[13px] text-muted-foreground sm:block">
                    {canjeUser(canje)}
                  </span>
                  <span className="w-20 shrink-0 text-right text-[13px] tabular-nums text-foreground">
                    {canjePrice(canje).toLocaleString()}
                  </span>
                  <span className="hidden w-32 shrink-0 text-[12px] text-muted-foreground md:block">
                    {formatDate(canje.fecha)}
                  </span>
                  <div className={cn("flex w-28 shrink-0 items-center gap-1 text-[12px] font-medium", status.className)}>
                    <StatusIcon className="size-3" aria-hidden="true" />
                    {status.label}
                  </div>
                  <div className="flex w-40 shrink-0 items-center justify-end gap-1.5">
                    {canje.estado === "pendiente" && (
                      <>
                        <ActionBtn
                          label="Deliver"
                          onClick={() => handleUpdate(String(canje.id), "entregado")}
                          disabled={pending}
                          primary
                        />
                        <ActionBtn
                          label="Cancel"
                          onClick={() => handleUpdate(String(canje.id), "cancelado")}
                          disabled={pending}
                        />
                      </>
                    )}
                    {canje.estado === "entregado" && (
                      <ActionBtn
                        label="Return"
                        onClick={() => handleUpdate(String(canje.id), "devuelto")}
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
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
          <p className="text-[13px] text-muted-foreground">
            {search.trim() ? `No results match "${search.trim()}".` : "No redemptions yet."}
          </p>
        </div>
      )}
    </div>
  )
}

function ActionBtn({
  label,
  onClick,
  disabled,
  primary,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  primary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-6 rounded-full px-2.5 text-[11px] font-medium transition-colors disabled:opacity-50",
        primary
          ? "bg-gold text-gold-foreground hover:opacity-85"
          : "border border-border text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  )
}
