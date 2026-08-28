"use server"

import { revalidatePath } from "next/cache"
import { fetchWithAuth } from "@/lib/admin-fetch"

/** Update a user's points (add or set).
 *  Backend expects { puntos, operation, motivo } where operation is
 *  'add' or 'set' and motivo is required. */
export async function updateUsuarioPuntos(
  id: string,
  puntos: number,
  operation: "add" | "set",
  motivo: string,
): Promise<{ error?: string }> {
  const result = await fetchWithAuth({
    method: "PUT",
    path: `/api/usuarios/${id}/puntos`,
    body: { puntos, operation, motivo },
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/usuarios")
  revalidatePath(`/shop/admin/usuarios/${id}`)
  return {}
}

/** Grant VIP to a user. */
export async function grantVip(
  usuarioId: string,
  durationDays?: number,
): Promise<{ error?: string }> {
  const body: Record<string, unknown> = {}
  if (durationDays) body.duration_days = durationDays

  const result = await fetchWithAuth({
    method: "POST",
    path: `/api/kick-admin/usuario/${usuarioId}/vip`,
    body,
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/usuarios")
  revalidatePath(`/shop/admin/usuarios/${usuarioId}`)
  return {}
}

/** Remove VIP from a user. */
export async function removeVip(usuarioId: string): Promise<{ error?: string }> {
  const result = await fetchWithAuth({
    method: "DELETE",
    path: `/api/kick-admin/usuario/${usuarioId}/vip`,
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/usuarios")
  revalidatePath(`/shop/admin/usuarios/${usuarioId}`)
  return {}
}
