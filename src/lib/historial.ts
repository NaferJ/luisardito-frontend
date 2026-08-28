import { apiFetch } from '@/lib/api'
import type { HistorialPunto } from '@/types'

/** Fetch the current user's points history. Requires auth. */
export async function getMyHistorial(
  usuarioId: number,
  includeAll = false,
): Promise<HistorialPunto[]> {
  try {
    const endpoint = includeAll
      ? `/api/historial-puntos/${usuarioId}/completo`
      : `/api/historial-puntos/${usuarioId}`
    const response = await apiFetch<{ data: HistorialPunto[] } | HistorialPunto[]>(endpoint)
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}
