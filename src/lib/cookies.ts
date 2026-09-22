import { cookies, headers } from 'next/headers'
import { getRequestHostContext, type RequestHostContext } from '@/lib/request-url'

export const AUTH_COOKIE = 'auth_token'
export const REFRESH_COOKIE = 'refresh_token'

const AUTH_MAX_AGE = 30 * 24 * 60 * 60
const REFRESH_MAX_AGE = 90 * 24 * 60 * 60

function getCookieOptions(context: RequestHostContext, maxAge: number, includeDomain = true) {
  return {
    httpOnly: true,
    secure: context.secure,
    sameSite: context.secure ? ('none' as const) : ('lax' as const),
    path: '/',
    maxAge,
    ...(includeDomain && context.cookieDomain ? { domain: context.cookieDomain } : {}),
  }
}

export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(AUTH_COOKIE)?.value
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(REFRESH_COOKIE)?.value
}

export async function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
): Promise<void> {
  const cookieStore = await cookies()
  const context = getRequestHostContext(await headers())
  cookieStore.set(AUTH_COOKIE, accessToken, getCookieOptions(context, AUTH_MAX_AGE))
  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE, refreshToken, getCookieOptions(context, REFRESH_MAX_AGE))
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  const context = getRequestHostContext(await headers())
  const expires = new Date(0)
  const options = { ...getCookieOptions(context, 0), expires }
  cookieStore.set(AUTH_COOKIE, '', options)
  cookieStore.set(REFRESH_COOKIE, '', options)
}
