import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth'
import { ProfileView } from '@/components/shop/profile-view'
import { logout } from '@/app/shop/auth/actions'

export const metadata: Metadata = {
  title: 'Profile — Luisardito Shop',
  description: 'Your account profile, points, and connected accounts.',
}

export default async function PerfilPage() {
  const user = await requireAuth()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Profile</h1>
        <p className="text-[15px] text-muted-foreground">
          Your account, points, and connected services.
        </p>
      </div>

      <ProfileView user={user} onLogout={logout} />
    </div>
  )
}
