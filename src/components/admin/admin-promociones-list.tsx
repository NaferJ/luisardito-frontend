"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Search, Plus, Trash2, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { deletePromocion } from "@/app/shop/admin/promociones/actions"
import type { Promocion } from "@/types"

type EstadoFilter = "all" | "activo" | "programado" | "expirado" | "inactivo" | "pausado"

const ESTADO_OPTIONS: { value: EstadoFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "activo", label: "Active" },
  { value: "programado", label: "Scheduled" },
  { value: "expirado", label: "Expired" },
  { value: "inactivo", label: "Inactive" },
  { value: "pausado", label: "Paused" },
]

const ESTADO_STYLES: Record<string, string> = {
  activo: "bg-gold/15 text-gold-bright",
  programado: "bg-foreground/10 text-foreground",
  expirado: "bg-destructive/10 text-destructive",
  inactivo: "bg-secondary text-muted-foreground",
  pausado: "bg-secondary text-muted-foreground",
}

function formatDate(d: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(d))
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

export function AdminPromocionesList({ promociones }: { promociones: Promocion[] }) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("all")
  const [pending, startTransition] = useTransition()

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
    result.sort((a, b) => new Date(b.actualizado).getTime() - new Date(a.actualizado).getTime())
    return result
  }, [promociones, search, estadoFilter])

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete promotion "${name}"? This is a soft delete.`)) return
    startTransition(async () => {
      await deletePromocion(String(id))
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Promotions</h1>
          <span className="text-[13px] text-muted-foreground">
            {filtered.length} of {promociones.length}
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
              aria-label="Search promotions"
              className="h-8 w-44 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-56 focus:border-gold focus:outline-none transition-all"
            />
          </div>
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

      {/* Estado filter pills */}
      <div className="flex flex-wrap gap-2">
        {ESTADO_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setEstadoFilter(opt.value)}
            aria-pressed={estadoFilter === opt.value}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
              estadoFilter === opt.value
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
          <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="min-w-0 flex-1">Name</span>
            <span className="w-20 shrink-0 text-right">Discount</span>
            <span className="hidden w-28 shrink-0 sm:block">Start</span>
            <span className="hidden w-28 shrink-0 sm:block">End</span>
            <span className="w-24 shrink-0">Status</span>
            <span className="w-24 shrink-0 text-right">Actions</span>
          </div>
          <div className="flex flex-col">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] font-medium text-foreground">
                    {p.titulo || p.nombre}
                  </p>
                  {p.codigo && (
                    <p className="truncate font-mono text-[12px] text-muted-foreground">{p.codigo}</p>
                  )}
                </div>
                <span className="w-20 shrink-0 text-right text-[13px] font-medium text-gold-bright">
                  {discountLabel(p)}
                </span>
                <span className="hidden w-28 shrink-0 text-[12px] text-muted-foreground sm:block">
                  {formatDate(p.fecha_inicio)}
                </span>
                <span className="hidden w-28 shrink-0 text-[12px] text-muted-foreground sm:block">
                  {formatDate(p.fecha_fin)}
                </span>
                <span className={cn("w-24 shrink-0 rounded-full px-2 py-0.5 text-center text-[11px] font-medium", ESTADO_STYLES[p.estado] ?? ESTADO_STYLES.inactivo)}>
                  {p.estado}
                </span>
                <div className="flex w-24 shrink-0 items-center justify-end gap-2">
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
            ))}
          </div>
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
  )
}
