"use client"

import { Tag, Clock, Percent, TrendingDown } from "lucide-react"
import { useI18n, useLocale } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"
import type { Dictionary } from "@/lib/i18n/shared"
import { cn } from "@/lib/utils"
import type { Promocion } from "@/types"

function formatDate(dateString: string, locale: "es" | "en"): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString))
}

function discountLabel(promo: Promocion, t: Dictionary["promociones"]): string {
  switch (promo.tipo_descuento) {
    case "porcentaje":
      return interpolate(t.discount.generic, { value: `${promo.valor_descuento}%` })
    case "fijo":
      return interpolate(t.discount.generic, { value: `${promo.valor_descuento} pts` })
    case "2x1":
      return t.discount.twoForOne
    case "3x2":
      return t.discount.threeForTwo
    default:
      return interpolate(t.discount.generic, { value: String(promo.valor_descuento) })
  }
}

function daysLeft(fechaFin: string): number {
  const now = new Date()
  const end = new Date(fechaFin)
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function usageLabel(usageLeft: number | null, usesExhausted: string, usesLeftOne: string, usesLeftMany: string): string {
  if (usageLeft !== null && usageLeft <= 0) return usesExhausted
  if (usageLeft === 1) return usesLeftOne
  return interpolate(usesLeftMany, { n: usageLeft ?? 0 })
}

export function PromocionesGrid({ promociones }: Readonly<{ promociones: Promocion[] }>) {
  const { dictionary } = useI18n()
  const locale = useLocale()
  const t = dictionary.promociones

  if (promociones.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8">
        <Tag className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-medium text-foreground">{t.empty}</p>
        <p className="text-[13px] text-muted-foreground">
          {t.emptyHint}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {promociones.map((promo) => {
        const remaining = daysLeft(promo.fecha_fin)
        const isExpiringSoon = remaining <= 3 && remaining > 0
        const usageLeft =
          promo.cantidad_usos_maximos !== null
            ? promo.cantidad_usos_maximos - promo.cantidad_usos_actuales
            : null
        const currentUsageLabel = usageLabel(usageLeft, t.usesExhausted, t.usesLeftOne, t.usesLeftMany)

        return (
          <div
            key={promo.id}
            className={cn(
              "flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4 transition-colors hover:border-gold/50",
              isExpiringSoon && "border-gold/40",
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-[15px] font-semibold text-foreground">
                  {promo.titulo || promo.nombre}
                </span>
                {promo.codigo && (
                  <span className="font-mono text-[12px] text-muted-foreground">
                    {t.code}: {promo.codigo}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[12px] font-bold text-gold-foreground">
                {promo.tipo_descuento === "porcentaje" ? (
                  <Percent className="size-3" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3" aria-hidden="true" />
                )}
                {discountLabel(promo, t)}
              </span>
            </div>

            {/* Description */}
            {promo.descripcion && (
              <p className="line-clamp-2 text-[13px] text-muted-foreground">
                {promo.descripcion}
              </p>
            )}

            {/* Footer: dates + usage */}
            <div className="mt-auto flex flex-col gap-1.5 border-t border-border/50 pt-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3" aria-hidden="true" />
                  {formatDate(promo.fecha_inicio, locale)} — {formatDate(promo.fecha_fin, locale)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px]">
                {remaining > 0 ? (
                  <span
                    className={cn(
                      "font-medium",
                      isExpiringSoon ? "text-gold-bright" : "text-muted-foreground",
                    )}
                  >
                    {remaining} {remaining === 1 ? t.day : t.days} {t.left}
                  </span>
                ) : (
                  <span className="font-medium text-destructive">{t.expired}</span>
                )}
                {usageLeft !== null && (
                  <span className="text-muted-foreground">
                    {currentUsageLabel}
                  </span>
                )}
                {promo.requiere_codigo && (
                  <span className="text-muted-foreground">{t.codeRequired}</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
