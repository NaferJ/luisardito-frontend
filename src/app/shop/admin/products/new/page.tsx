import Link from "next/link"
import { requireAdmin } from "@/lib/auth"
import { ProductForm } from "@/components/admin/product-form"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  await requireAdmin()

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Link href="/shop/admin/products" className="hover:text-foreground">
            Products
          </Link>
          <span>/</span>
          <span className="text-foreground">New</span>
        </div>
        <h1 className="text-[15px] font-medium text-foreground">Create new product</h1>
      </div>

      <ProductForm mode="create" />
    </div>
  )
}
