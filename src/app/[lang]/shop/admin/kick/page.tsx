import { requireAdmin } from "@/lib/auth"
import {
  getKickPointsConfig,
  getKickAdminConfig,
  getBroadcasterStatus,
} from "@/lib/admin"
import { KickConfigView } from "@/components/admin/kick-config-view"

export const dynamic = "force-dynamic"

export default async function AdminKickPage() {
  await requireAdmin()

  const [pointsConfig, adminConfig, broadcasterStatus] = await Promise.all([
    getKickPointsConfig(),
    getKickAdminConfig(),
    getBroadcasterStatus(),
  ])

  return (
    <KickConfigView
      pointsConfig={pointsConfig}
      adminConfig={adminConfig}
      broadcasterStatus={broadcasterStatus}
    />
  )
}
