import type { Metadata } from 'next'
import { getActivePromociones } from '@/lib/promociones'
import { PromocionesGrid } from '@/components/shop/promociones-grid'

export const metadata: Metadata = {
  title: 'Promotions — Luisardito Shop',
  description: 'Active promotions and discounts on rewards.',
}

export default async function PromocionesPage() {
  const promociones = await getActivePromociones()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Promotions</h1>
        <p className="text-[15px] text-muted-foreground">
          {promociones.length > 0
            ? `${promociones.length} active ${promociones.length === 1 ? "promotion" : "promotions"}`
            : "Active promotions and discounts on rewards."}
        </p>
      </div>

      <PromocionesGrid promociones={promociones} />
    </div>
  )
}
