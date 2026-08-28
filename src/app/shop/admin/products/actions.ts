"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { fetchWithAuthOrThrow } from "@/lib/admin-fetch"

export interface ProductFormData {
  nombre: string
  descripcion: string
  precio: number
  stock: number
  estado: "publicado" | "borrador"
  imagen_url?: string
  imagen_width?: number
  imagen_height?: number
  slug?: string
}

export async function createProduct(formData: ProductFormData): Promise<void> {
  await fetchWithAuthOrThrow({ method: "POST", path: "/api/productos", body: formData })
  revalidatePath("/shop/admin/products")
  redirect("/shop/admin/products")
}

export async function updateProduct(id: string, formData: ProductFormData): Promise<void> {
  await fetchWithAuthOrThrow({ method: "PUT", path: `/api/productos/${id}`, body: formData })
  revalidatePath("/shop/admin/products")
  redirect("/shop/admin/products")
}

export async function archiveProduct(id: string): Promise<void> {
  // Soft-delete: set estado to 'eliminado' so the product disappears from the
  // public feed but stays in the database. This preserves redemption history
  // and foreign key references. Can be un-archived by setting estado back.
  await fetchWithAuthOrThrow({ method: "PUT", path: `/api/productos/${id}`, body: { estado: "eliminado" } })
  revalidatePath("/shop/admin/products")
}
