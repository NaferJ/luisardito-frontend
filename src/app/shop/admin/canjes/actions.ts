"use server"

import { revalidatePath } from "next/cache"
import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"

/** Update a redemption's status (pendiente → entregado → cancelado). */
export async function updateCanjeEstado(
  id: string,
  estado: "pendiente" | "entregado" | "cancelado" | "devuelto",
): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/canjes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ estado }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/canjes")
  return {}
}

/** Return a redemption (refund points to user). */
export async function devolverCanje(id: string): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/canjes/${id}/devolver`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/canjes")
  return {}
}
