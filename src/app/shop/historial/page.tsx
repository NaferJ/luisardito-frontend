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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Points History</h1>
        <p className="text-[15px] text-muted-foreground">
          {historial.length > 0
            ? `${historial.length} ${historial.length === 1 ? 'entry' : 'entries'}`
            : 'Your complete points movement history.'}
        </p>
      </div>

      <HistorialList historial={historial} currentPoints={user.puntos} />
    </div>
  )
}
