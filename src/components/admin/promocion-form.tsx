"use client"

import { useState, useTransition } from "react"
import { useLocalizedRouter } from "@/components/i18n/use-localized-router"
import { useI18n } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"
import type { Dictionary } from "@/lib/i18n/shared"
import { cn } from "@/lib/utils"
import {
  createPromocion,
  updatePromocion,
  type PromocionFormData,
} from "@/app/[lang]/shop/admin/promociones/actions"
import type { Promocion } from "@/types"

type PromoFormDict = Dictionary["admin"]["promocionForm"]

const TIPO_OPTIONS = [
  { value: "producto", label: (t: PromoFormDict) => t.tipos.producto },
  { value: "categoria", label: (t: PromoFormDict) => t.tipos.categoria },
  { value: "global", label: (t: PromoFormDict) => t.tipos.global },
  { value: "por_cantidad", label: (t: PromoFormDict) => t.tipos.por_cantidad },
] as const

const DESCUENTO_OPTIONS = [
  { value: "porcentaje", label: (t: PromoFormDict) => t.descuentos.porcentaje },
  { value: "fijo", label: (t: PromoFormDict) => t.descuentos.fijo },
  { value: "2x1", label: (t: PromoFormDict) => t.descuentos["2x1"] },
  { value: "3x2", label: (t: PromoFormDict) => t.descuentos["3x2"] },
] as const

function toInputDate(dateStr: string): string {
  if (!dateStr) return ""
  return new Date(dateStr).toISOString().slice(0, 10)
}

function emptyForm(): PromocionFormData {
  return {
    codigo: null,
    nombre: "",
    titulo: "",
    descripcion: null,
    tipo: "producto",
    tipo_descuento: "porcentaje",
    valor_descuento: 10,
    descuento_maximo: null,
    fecha_inicio: new Date().toISOString().slice(0, 10),
    fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    cantidad_usos_maximos: null,
    usos_por_usuario: 1,
    minimo_puntos: 0,
    requiere_codigo: false,
    prioridad: 0,
    aplica_acumulacion: false,
  }
}

function fromPromocion(p: Promocion): PromocionFormData {
  return {
    codigo: p.codigo,
    nombre: p.nombre,
    titulo: p.titulo,
    descripcion: p.descripcion,
    tipo: p.tipo,
    tipo_descuento: p.tipo_descuento,
    valor_descuento: p.valor_descuento,
    descuento_maximo: p.descuento_maximo,
    fecha_inicio: toInputDate(p.fecha_inicio),
    fecha_fin: toInputDate(p.fecha_fin),
    cantidad_usos_maximos: p.cantidad_usos_maximos,
    usos_por_usuario: p.usos_por_usuario,
    minimo_puntos: p.minimo_puntos,
    requiere_codigo: p.requiere_codigo,
    prioridad: p.prioridad,
    aplica_acumulacion: p.aplica_acumulacion,
  }
}

export function PromocionForm({
  mode,
  initialData,
}: Readonly<{
  mode: "create" | "edit"
  initialData?: Promocion
}>) {
  const router = useLocalizedRouter()
  const { dictionary } = useI18n()
  const t = dictionary.admin.promocionForm
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<PromocionFormData>(
    initialData ? fromPromocion(initialData) : emptyForm(),
  )

  const set = <K extends keyof PromocionFormData>(key: K, value: PromocionFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        if (mode === "create") {
          await createPromocion(form)
        } else if (initialData) {
          await updatePromocion(String(initialData.id), form)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t.errors.generic)
      }
    })
  }

  let saveLabel = t.actions.save
  if (pending) saveLabel = t.actions.saving
  else if (mode === "create") saveLabel = t.actions.create

  return (
    <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      {error && (
        <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-4 py-2.5 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* Nombre + Titulo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.fields.name}>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t.fields.title}>
          <input
            type="text"
            required
            value={form.titulo}
            onChange={(e) => set("titulo", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Codigo + Descripcion */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={interpolate(t.fields.optionalLabel, { label: t.fields.code })}>
          <input
            type="text"
            value={form.codigo ?? ""}
            onChange={(e) => set("codigo", e.target.value || null)}
            placeholder={t.codePlaceholder}
            className={inputClass}
          />
        </Field>
        <Field label={interpolate(t.fields.optionalLabel, { label: t.fields.description })}>
          <input
            type="text"
            value={form.descripcion ?? ""}
            onChange={(e) => set("descripcion", e.target.value || null)}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Tipo + Descuento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.fields.type}>
          <select
            value={form.tipo}
            onChange={(e) => set("tipo", e.target.value as PromocionFormData["tipo"])}
            className={inputClass}
          >
            {TIPO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label(t)}</option>
            ))}
          </select>
        </Field>
        <Field label={t.fields.discountType}>
          <select
            value={form.tipo_descuento}
            onChange={(e) => set("tipo_descuento", e.target.value as PromocionFormData["tipo_descuento"])}
            className={inputClass}
          >
            {DESCUENTO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label(t)}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Valor + Max descuento */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.fields.value}>
          <input
            type="number"
            required
            min={0}
            value={form.valor_descuento}
            onChange={(e) => set("valor_descuento", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label={interpolate(t.fields.optionalLabel, { label: t.fields.maxDiscount })}>
          <input
            type="number"
            min={0}
            value={form.descuento_maximo ?? ""}
            onChange={(e) => set("descuento_maximo", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.fields.start}>
          <input
            type="date"
            required
            value={form.fecha_inicio}
            onChange={(e) => set("fecha_inicio", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label={t.fields.end}>
          <input
            type="date"
            required
            value={form.fecha_fin}
            onChange={(e) => set("fecha_fin", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Usos + Minimo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label={interpolate(t.fields.optionalLabel, { label: t.fields.maxUses })}>
          <input
            type="number"
            min={0}
            value={form.cantidad_usos_maximos ?? ""}
            onChange={(e) => set("cantidad_usos_maximos", e.target.value ? Number(e.target.value) : null)}
            className={inputClass}
          />
        </Field>
        <Field label={t.fields.usesPerUser}>
          <input
            type="number"
            required
            min={1}
            value={form.usos_por_usuario}
            onChange={(e) => set("usos_por_usuario", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label={t.fields.minPoints}>
          <input
            type="number"
            required
            min={0}
            value={form.minimo_puntos}
            onChange={(e) => set("minimo_puntos", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Prioridad + Toggles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t.fields.priority}>
          <input
            type="number"
            required
            min={0}
            value={form.prioridad}
            onChange={(e) => set("prioridad", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <div className="flex flex-col gap-3 pt-5">
          <Toggle
            label={t.fields.requiresCode}
            checked={form.requiere_codigo}
            onChange={(v) => set("requiere_codigo", v)}
          />
          <Toggle
            label={t.fields.allowsStacking}
            checked={form.aplica_acumulacion}
            onChange={(v) => set("aplica_acumulacion", v)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="flex h-9 items-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {saveLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push("/shop/admin/promociones")}
          className="flex h-9 items-center rounded-full border border-border px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          {t.actions.cancel}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  "h-9 w-full rounded-sm border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"

function Field({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: Readonly<{
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}>) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <span
        className={cn(
          "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
          checked ? "bg-gold" : "bg-border",
        )}
      >
        <span
          className={cn(
            "size-4 rounded-full bg-background transition-transform",
            checked && "translate-x-4",
          )}
        />
      </span>
      <span className="text-[13px] text-foreground">{label}</span>
    </button>
  )
}
