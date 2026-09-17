"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { fetchWithAuth } from "@/lib/admin-fetch"
import type { PromocionEstadisticas } from "@/types"

export interface PromocionFormData {
  codigo?: string | null
  nombre: string
  titulo: string
  descripcion?: string | null
  tipo: "producto" | "categoria" | "global" | "por_cantidad"
  tipo_descuento: "porcentaje" | "fijo" | "2x1" | "3x2"
  valor_descuento: number
  descuento_maximo?: number | null
  fecha_inicio: string
  fecha_fin: string
  cantidad_usos_maximos?: number | null
  usos_por_usuario: number
  minimo_puntos: number
  requiere_codigo: boolean
  prioridad: number
  aplica_acumulacion: boolean
}

export async function createPromocion(formData: PromocionFormData): Promise<void> {
  const result = await fetchWithAuth({ method: "POST", path: "/api/promociones", body: formData })
  if (!result.ok) throw new Error(result.error)
  revalidatePath("/shop/admin/promociones")
  redirect("/shop/admin/promociones")
}

export async function updatePromocion(id: string, formData: PromocionFormData): Promise<void> {
  const result = await fetchWithAuth({ method: "PUT", path: `/api/promociones/${id}`, body: formData })
  if (!result.ok) throw new Error(result.error)
  revalidatePath("/shop/admin/promociones")
  redirect("/shop/admin/promociones")
}

export async function deletePromocion(id: string): Promise<{ error?: string }> {
  const result = await fetchWithAuth({ method: "DELETE", path: `/api/promociones/${id}` })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/promociones")
  return {}
}

/** Fetch promotion usage statistics (admin only). Server action so the
 *  auth token from next/headers is available — the client component
 *  can't import cookies.ts directly. */
export async function fetchPromocionEstadisticas(
  id: string,
): Promise<{ data?: PromocionEstadisticas; error?: string }> {
  const result = await fetchWithAuth<PromocionEstadisticas>({
    method: "GET",
    path: `/api/promociones/${id}/estadisticas`,
  })
  if (!result.ok) return { error: result.error }
  return { data: result.data }
}
