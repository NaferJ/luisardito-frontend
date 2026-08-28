import { requireAdmin } from "@/lib/auth"
import { getAllCanjes } from "@/lib/admin"
import { AdminCanjesList } from "@/components/admin/admin-canjes-list"

export const dynamic = "force-dynamic"

export default async function AdminCanjesPage() {
  await requireAdmin()
  const canjes = await getAllCanjes()

  return <AdminCanjesList canjes={canjes} />
}
