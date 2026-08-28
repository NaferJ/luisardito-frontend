import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { getMyHistorial } from '@/lib/historial'
import { HistorialList } from '@/components/shop/historial-list'

export const metadata: Metadata = {
  title: 'Points History — Luisardito Shop',
  description: 'Your complete points movement history.',
}

export default async function HistorialPage() {
  const user = await requireAuth()
  const historial = await getMyHistorial(user.id)

  let subtitle = 'Your complete points movement history.'
  if (historial.length > 0) {
    const unit = historial.length === 1 ? 'entry' : 'entries'
    subtitle = `${historial.length} ${unit}`
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Points History</h1>
        <p className="text-[15px] text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <HistorialList historial={historial} />
    </div>
  )
}
