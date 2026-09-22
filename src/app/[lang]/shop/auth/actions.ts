'use server'

import { API_BASE_URL } from '@/lib/api'
import { clearAuthCookies, getRefreshToken } from '@/lib/cookies'
import { getRequestLocale } from '@/lib/i18n/request-locale'

export async function logout(): Promise<string> {
  const locale = await getRequestLocale()
  const refreshToken = await getRefreshToken()

  if (refreshToken) {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5_000),
    }).catch(() => undefined)
  }

  await clearAuthCookies()
  return `/${locale}/shop`
}
