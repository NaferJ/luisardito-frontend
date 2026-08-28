"use server"

import { revalidatePath } from "next/cache"
import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"

/** Update a user's points (add or set).
 *  Backend expects { puntos, operation, motivo } where operation is
 *  'add' or 'set' and motivo is required. */
export async function updateUsuarioPuntos(
  id: string,
  puntos: number,
  operation: "add" | "set",
  motivo: string,
): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/usuarios/${id}/puntos`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ puntos, operation, motivo }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/usuarios")
  revalidatePath(`/shop/admin/usuarios/${id}`)
  return {}
}

/** Grant VIP to a user. */
export async function grantVip(
  usuarioId: string,
  durationDays?: number,
): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const body: Record<string, unknown> = {}
  if (durationDays) body.duration_days = durationDays

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/usuario/${usuarioId}/vip`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/usuarios")
  revalidatePath(`/shop/admin/usuarios/${usuarioId}`)
  return {}
}

/** Remove VIP from a user. */
export async function removeVip(usuarioId: string): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/usuario/${usuarioId}/vip`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/usuarios")
  revalidatePath(`/shop/admin/usuarios/${usuarioId}`)
  return {}
}
