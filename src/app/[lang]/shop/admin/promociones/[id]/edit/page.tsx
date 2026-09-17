import { LocaleLink } from "@/components/i18n/locale-link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { getPromocionById } from "@/lib/admin"
import { PromocionForm } from "@/components/admin/promocion-form"
import { getDictionary } from "@/lib/i18n"

export const dynamic = "force-dynamic"

interface EditPageProps {
  readonly params: Promise<{ id: string }>
}

export default async function EditPromocionPage({ params }: EditPageProps) {
  await requireAdmin()
  const dictionary = await getDictionary()
  const t = dictionary.admin
  const { id } = await params

  const promocion = await getPromocionById(id)
  if (!promocion) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <LocaleLink href="/shop/admin/promociones" className="hover:text-foreground">
            {t.pages.promotions}
          </LocaleLink>
          <span>/</span>
          <span className="text-foreground">{t.pages.editPromotion}</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">{t.promocionForm.titleEdit} {promocion.titulo || promocion.nombre}</h1>
      </div>

      <PromocionForm mode="edit" initialData={promocion} />
    </div>
  )
}
