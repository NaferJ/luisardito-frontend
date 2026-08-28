import { redirect } from 'next/navigation'
import { apiFetch } from '@/lib/api'
import { getAuthToken } from '@/lib/cookies'
import type { Usuario } from '@/types'

const ADMIN_ROLES = [3, 4, 5]

export async function getCurrentUser(): Promise<Usuario | null> {
  const token = await getAuthToken()
  if (!token) return null

  try {
    return await apiFetch<Usuario>('/api/usuarios/me')
  } catch {
    return null
  }
}

export async function requireAuth(): Promise<Usuario> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/shop')
  }
  return user
}

export async function requireAdmin(): Promise<Usuario> {
  const user = await requireAuth()
  if (!ADMIN_ROLES.includes(user.rol_id)) {
    redirect('/shop')
  }
  return user
}
