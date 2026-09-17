import { requireAdmin } from "@/lib/auth"
import { apiFetch } from "@/lib/api"
import { AdminProductList } from "@/components/admin/admin-product-list"
import type { Producto } from "@/types"

export const dynamic = "force-dynamic"

export default async function AdminProductsPage() {
  await requireAdmin()

  let products: Producto[] = []
  try {
    products = await apiFetch<Producto[]>("/api/productos/admin")
  } catch {
    try {
      products = await apiFetch<Producto[]>("/api/productos")
    } catch {
      products = []
    }
  }

  return <AdminProductList products={products} />
}
