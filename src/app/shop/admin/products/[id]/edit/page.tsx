import Link from "next/link"
import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { ProductForm } from "@/components/admin/product-form"
import type { Producto } from "@/types"

export const dynamic = "force-dynamic"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditPageProps) {
  await requireAdmin()
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
          <Link href="/shop/admin/products" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">Edit</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">Edit {product.nombre}</h1>
      </div>

      <ProductForm mode="edit" initialData={product} />
    </div>
  )
}
