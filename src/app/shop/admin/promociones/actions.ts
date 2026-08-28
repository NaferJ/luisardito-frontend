"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"
import type { PromocionEstadisticas } from "@/types"

type PromocionEstadisticasResult = PromocionEstadisticas

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
  const token = await getAuthToken()
  if (!token) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE_URL}/api/promociones`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(
      (data as { error?: string }).error ?? `Failed to create promotion (${response.status})`,
    )
  }

  revalidatePath("/shop/admin/promociones")
  redirect("/shop/admin/promociones")
}

export async function updatePromocion(id: string, formData: PromocionFormData): Promise<void> {
  const token = await getAuthToken()
  if (!token) throw new Error("Not authenticated")

  const response = await fetch(`${API_BASE_URL}/api/promociones/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(
      (data as { error?: string }).error ?? `Failed to update promotion (${response.status})`,
    )
  }

  revalidatePath("/shop/admin/promociones")
  redirect("/shop/admin/promociones")
}

export async function deletePromocion(id: string): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/promociones/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/promociones")
  return {}
}

/** Fetch promotion usage statistics (admin only). Server action so the
 *  auth token from next/headers is available — the client component
 *  can't import cookies.ts directly. */
export async function fetchPromocionEstadisticas(
  id: string,
): Promise<{ data?: PromocionEstadisticasResult; error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/promociones/${id}/estadisticas`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    return { error: `Failed (${response.status})` }
  }

  const data = (await response.json()) as PromocionEstadisticasResult
  return { data }
}
