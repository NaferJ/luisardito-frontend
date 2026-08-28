"use server"

import { revalidatePath } from "next/cache"
import { fetchWithAuth } from "@/lib/admin-fetch"

/** Update a redemption's status (pendiente → entregado → cancelado). */
export async function updateCanjeEstado(
  id: string,
  estado: "pendiente" | "entregado" | "cancelado" | "devuelto",
): Promise<{ error?: string }> {
  const result = await fetchWithAuth({ method: "PUT", path: `/api/canjes/${id}`, body: { estado } })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/canjes")
  return {}
}

/** Return a redemption (refund points to user). Optionally include a reason. */
export async function devolverCanje(id: string, motivo?: string): Promise<{ error?: string }> {
  const result = await fetchWithAuth({
    method: "PUT",
    path: `/api/canjes/${id}/devolver`,
    body: motivo ? { motivo } : {},
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/canjes")
  return {}
}
