import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { getPromocionById } from "@/lib/admin"
import { PromocionForm } from "@/components/admin/promocion-form"

export const dynamic = "force-dynamic"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPromocionPage({ params }: EditPageProps) {
  await requireAdmin()
  const { id } = await params

  const promocion = await getPromocionById(id)
  if (!promocion) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Link href="/shop/admin/promociones" className="hover:text-foreground">
            Promotions
          </Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">Edit {promocion.titulo || promocion.nombre}</h1>
      </div>

      <PromocionForm mode="edit" initialData={promocion} />
    </div>
  )
}
