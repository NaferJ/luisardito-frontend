import { LocaleLink } from "@/components/i18n/locale-link"
import { requireAdmin } from "@/lib/auth"
import { ProductForm } from "@/components/admin/product-form"
import { getDictionary } from "@/lib/i18n"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  await requireAdmin()
  const dictionary = await getDictionary()
  const t = dictionary.admin

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <LocaleLink href="/shop/admin/products" className="hover:text-foreground">
            {t.pages.products}
          </LocaleLink>
          <span>/</span>
          <span className="text-foreground">{t.pages.newProduct}</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">{t.productForm.titleNew}</h1>
      </div>

      <ProductForm mode="create" />
    </div>
  )
}
