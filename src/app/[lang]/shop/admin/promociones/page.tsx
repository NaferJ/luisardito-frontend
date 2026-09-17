import { requireAdmin } from "@/lib/auth"
import { getAllPromociones } from "@/lib/admin"
import { AdminPromocionesList } from "@/components/admin/admin-promociones-list"

export const dynamic = "force-dynamic"

export default async function AdminPromocionesPage() {
  await requireAdmin()
  const promociones = await getAllPromociones()

  return <AdminPromocionesList promociones={promociones} />
}
