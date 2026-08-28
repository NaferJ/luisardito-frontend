import { apiFetch } from '@/lib/api'
import type { Promocion } from '@/types'

/** Fetch all active promotions. Public endpoint. */
export async function getActivePromociones(): Promise<Promocion[]> {
  try {
    const response = await apiFetch<{ data: Promocion[] } | Promocion[]>(
      '/api/promociones/activas',
      { skipAuth: true },
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}
