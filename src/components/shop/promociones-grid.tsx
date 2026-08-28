import { Tag, Clock, Percent, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Promocion } from "@/types"

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString))
}

function discountLabel(promo: Promocion): string {
  switch (promo.tipo_descuento) {
    case "porcentaje":
      return `${promo.valor_descuento}% off`
    case "fijo":
      return `${promo.valor_descuento} pts off`
    case "2x1":
      return "2 for 1"
    case "3x2":
      return "3 for 2"
    default:
      return `${promo.valor_descuento} off`
  }
}

function daysLeft(fechaFin: string): number {
  const now = new Date()
  const end = new Date(fechaFin)
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export function PromocionesGrid({ promociones }: { promociones: Promocion[] }) {
  if (promociones.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8">
        <Tag className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-medium text-foreground">No active promotions</p>
        <p className="text-[13px] text-muted-foreground">
          Check back later for discounts and special offers.
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
        const usageExhausted = usageLeft !== null && usageLeft <= 0

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
                    Code: {promo.codigo}
                  </span>
                )}
              </div>
              <span className="flex items-center gap-1 rounded-full bg-gold px-2.5 py-1 text-[12px] font-bold text-gold-foreground">
                {promo.tipo_descuento === "porcentaje" ? (
                  <Percent className="size-3" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3" aria-hidden="true" />
                )}
                {discountLabel(promo)}
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
                  {formatDate(promo.fecha_inicio)} — {formatDate(promo.fecha_fin)}
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
                    {remaining} {remaining === 1 ? "day" : "days"} left
                  </span>
                ) : (
                  <span className="font-medium text-destructive">Expired</span>
                )}
                {usageLeft !== null && (
                  <span className="text-muted-foreground">
                    {usageExhausted
                      ? "Uses exhausted"
                      : `${usageLeft} ${usageLeft === 1 ? "use" : "uses"} left`}
                  </span>
                )}
                {promo.requiere_codigo && (
                  <span className="text-muted-foreground">Code required</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
