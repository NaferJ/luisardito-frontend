import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { getMyCanjes } from '@/lib/canjes'
import { CanjesList } from '@/components/shop/canjes-list'

export const metadata: Metadata = {
  title: 'My Redemptions — Luisardito Shop',
  description: 'Your redemption history and status.',
}

export default async function CanjesPage() {
  await requireAuth()
  const canjes = await getMyCanjes()

  let subtitle = 'Track your redeemed rewards here.'
  if (canjes.length > 0) {
    const unit = canjes.length === 1 ? 'redemption' : 'redemptions'
    subtitle = `${canjes.length} ${unit}`
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">My Redemptions</h1>
        <p className="text-[15px] text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <CanjesList canjes={canjes} />
    </div>
  )
}
