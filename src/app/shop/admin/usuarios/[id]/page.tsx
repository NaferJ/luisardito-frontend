import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { getUsuarioById, getAllCanjes } from "@/lib/admin"
import { getMyHistorial } from "@/lib/historial"
import { AdminUsuarioDetail } from "@/components/admin/admin-usuario-detail"

export const dynamic = "force-dynamic"

interface DetailPageProps {
  params: Promise<{ id: string }>
}

export default async function AdminUsuarioDetailPage({ params }: DetailPageProps) {
  await requireAdmin()
  const { id } = await params

  const usuario = await getUsuarioById(id)
  if (!usuario) notFound()

  const [canjes, historial] = await Promise.all([
    getAllCanjes().then((all) => all.filter((c) => c.usuario_id === usuario.id)),
    getMyHistorial(usuario.id),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Link href="/shop/admin/usuarios" className="hover:text-foreground">
            Users
          </Link>
          <span>/</span>
          <span className="text-foreground">{usuario.id}</span>
        </div>
      </div>

      <AdminUsuarioDetail
        usuario={usuario}
        canjes={canjes}
        historial={historial}
      />
    </div>
  )
}
