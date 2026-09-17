import { LocaleLink } from "@/components/i18n/locale-link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { ProductForm } from "@/components/admin/product-form"
import { getDictionary } from "@/lib/i18n"
import type { Producto } from "@/types"

export const dynamic = "force-dynamic"

interface EditPageProps {
  readonly params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditPageProps) {
  await requireAdmin()
  const dictionary = await getDictionary()
  const t = dictionary.admin
  const { id } = await params

  let product: Producto | null = null
  try {
    product = await apiFetch<Producto>(`/api/productos/${id}`)
  } catch {
    notFound()
  }

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <LocaleLink href="/shop/admin/products" className="hover:text-foreground">
            {t.pages.products}
          </LocaleLink>
          <span>/</span>
          <span className="text-foreground">{t.pages.editProduct}</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">{t.productForm.titleEdit} {product.nombre}</h1>
      </div>

      <ProductForm mode="edit" initialData={product} />
    </div>
  )
}
