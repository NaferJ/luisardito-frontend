import { apiFetch } from '@/lib/api'
import type { Canje } from '@/types'

export const MY_CANJES_PAGE_SIZE = 10

export type CanjesStatus = 'pendiente' | 'entregado' | 'cancelado' | 'devuelto'
export type CanjesSort = 'date-desc' | 'date-asc'

export interface MyCanjesSummary {
  total: number
  total_points: number
  by_status: Record<CanjesStatus, number>
}

export interface MyCanjesPagination {
  total: number
  limit: number
  offset: number
  has_more: boolean
}

export interface MyCanjesPage {
  data: Canje[]
  pagination: MyCanjesPagination
  summary: MyCanjesSummary
}

export interface GetMyCanjesOptions {
  limit?: number
  offset?: number
  status?: CanjesStatus
  sort?: CanjesSort
}

const EMPTY_STATUS_COUNTS: Record<CanjesStatus, number> = {
  pendiente: 0,
  entregado: 0,
  cancelado: 0,
  devuelto: 0,
}

function canjePrice(canje: Canje): number {
  return (
    canje.precio_al_canje ??
    canje.Producto?.precio ??
    canje.producto?.precio ??
    0
  )
}

function pageFromLegacyArray(canjes: Canje[], limit: number, offset: number): MyCanjesPage {
  const byStatus = { ...EMPTY_STATUS_COUNTS }
  let totalPoints = 0
  for (const canje of canjes) {
    byStatus[canje.estado] += 1
    totalPoints += canjePrice(canje)
  }

  return {
    data: canjes.slice(offset, offset + limit),
    pagination: {
      total: canjes.length,
      limit,
      offset,
      has_more: offset + limit < canjes.length,
    },
    summary: {
      total: canjes.length,
      total_points: totalPoints,
      by_status: byStatus,
    },
  }
}

/** Fetch one page of the current user's redemptions. Requires auth. */
export async function getMyCanjes({
  limit = MY_CANJES_PAGE_SIZE,
  offset = 0,
  status,
  sort = 'date-desc',
}: GetMyCanjesOptions = {}): Promise<MyCanjesPage> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    sort,
  })
  if (status) params.set('estado', status)

  try {
    const response = await apiFetch<MyCanjesPage | Canje[]>(
      `/api/canjes/mios?${params.toString()}`,
    )
    return Array.isArray(response)
      ? pageFromLegacyArray(response, limit, offset)
      : response
  } catch {
    return {
      data: [],
      pagination: { total: 0, limit, offset, has_more: false },
      summary: {
        total: 0,
        total_points: 0,
        by_status: { ...EMPTY_STATUS_COUNTS },
      },
    }
  }
}
