import { requireAdmin } from "@/lib/auth"
import { getAllUsuarios, getAllCanjes } from "@/lib/admin"
import { AdminUsuariosList } from "@/components/admin/admin-usuarios-list"
import type { Canje } from "@/types"

export const dynamic = "force-dynamic"

export default async function AdminUsuariosPage() {
  await requireAdmin()
  const [usuarios, canjes] = await Promise.all([
    getAllUsuarios(),
    getAllCanjes(),
  ])

  // Group canjes by user ID for the detail drawer
  const canjesByUser: Record<number, Canje[]> = {}
  for (const c of canjes) {
    const uid = c.usuario_id
    if (!canjesByUser[uid]) canjesByUser[uid] = []
    canjesByUser[uid].push(c)
  }

  return <AdminUsuariosList usuarios={usuarios} canjesByUser={canjesByUser} />
}
