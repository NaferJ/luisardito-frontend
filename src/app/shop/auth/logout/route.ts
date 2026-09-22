import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api'
import { AUTH_COOKIE, getRefreshToken, REFRESH_COOKIE } from '@/lib/cookies'
import { getRequestLocale } from '@/lib/i18n/request-locale'
import {
  appendExpiredCookie,
  getRequestHostContext,
  publicPathUrl,
} from '@/lib/request-url'

export async function POST(request: Request): Promise<Response> {
  const locale = await getRequestLocale(request)
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

  const response = NextResponse.redirect(publicPathUrl(request, `/${locale}/shop`), 303)
  const context = getRequestHostContext(request.headers)
  appendExpiredCookie(response, AUTH_COOKIE, context)
  appendExpiredCookie(response, REFRESH_COOKIE, context)
  return response
}
