import { apiFetch } from '@/lib/api'
import type { Producto } from '@/types'

export async function getProducts(): Promise<Producto[]> {
  try {
    return await apiFetch<Producto[]>('/api/productos')
  } catch {
    return []
  }
}

export async function getProductBySlug(slug: string): Promise<Producto | null> {
  try {
    const isId = /^\d+$/.test(slug)
    const endpoint = isId ? `/api/productos/${slug}` : `/api/productos/slug/${slug}`
    return await apiFetch<Producto>(endpoint)
  } catch {
    return null
  }
}
