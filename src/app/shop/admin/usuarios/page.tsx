import { requireAdmin } from "@/lib/auth"
import { getAllUsuarios } from "@/lib/admin"
import { AdminUsuariosList } from "@/components/admin/admin-usuarios-list"

export const dynamic = "force-dynamic"

export default async function AdminUsuariosPage() {
  await requireAdmin()
  const usuarios = await getAllUsuarios()

  return <AdminUsuariosList usuarios={usuarios} />
}
