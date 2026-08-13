"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"

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
  const token = await getAuthToken()
  if (!token) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE_URL}/api/productos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(
      (data as { error?: string; message?: string }).error ??
        (data as { message?: string }).message ??
        `Failed to create product (${response.status})`,
    )
  }

  revalidatePath("/shop/admin/products")
  redirect("/shop/admin/products")
}

export async function updateProduct(id: string, formData: ProductFormData): Promise<void> {
  const token = await getAuthToken()
  if (!token) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(formData),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(
      (data as { error?: string; message?: string }).error ??
        (data as { message?: string }).message ??
        `Failed to update product (${response.status})`,
    )
  }

  revalidatePath("/shop/admin/products")
  redirect("/shop/admin/products")
}

export async function archiveProduct(id: string): Promise<void> {
  const token = await getAuthToken()
  if (!token) throw new Error("Not authenticated")

  // Soft-delete: set estado to 'eliminado' so the product disappears from the
  // public feed but stays in the database. This preserves redemption history
  // and foreign key references. Can be un-archived by setting estado back.
  const response = await fetch(`${API_BASE_URL}/api/productos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ estado: "eliminado" }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(
      (data as { error?: string; message?: string }).error ??
        (data as { message?: string }).message ??
        `Failed to archive product (${response.status})`,
    )
  }

  revalidatePath("/shop/admin/products")
}
