import { apiFetch } from '@/lib/api'
import type { Canje } from '@/types'

/** Fetch the current user's redemptions. Requires auth. */
export async function getMyCanjes(): Promise<Canje[]> {
  try {
    const response = await apiFetch<{ data: Canje[] } | Canje[]>('/api/canjes/mios')
    // Backend may wrap in { data: [...] } or return array directly
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}
