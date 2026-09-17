import { LocaleLink } from "@/components/i18n/locale-link"
import { requireAdmin } from "@/lib/auth"
import { PromocionForm } from "@/components/admin/promocion-form"
import { getDictionary } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function NewPromocionPage() {
  await requireAdmin()
  const dictionary = await getDictionary()
  const t = dictionary.admin

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <LocaleLink href="/shop/admin/promociones" className="hover:text-foreground">
            {t.pages.promotions}
          </LocaleLink>
          <span>/</span>
          <span className="text-foreground">{t.pages.newPromotion}</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">{t.promocionForm.titleNew}</h1>
      </div>

      <PromocionForm mode="create" />
    </div>
  )
}
