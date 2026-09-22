import { cookies } from 'next/headers'

const AUTH_COOKIE = 'auth_token'
const REFRESH_COOKIE = 'refresh_token'

const AUTH_MAX_AGE = 30 * 24 * 60 * 60
const REFRESH_MAX_AGE = 90 * 24 * 60 * 60

function isLocalhost(): boolean {
  const host = process.env.NEXT_PUBLIC_VERCEL_URL ?? ''
  const url = process.env.NEXT_PUBLIC_API_URL ?? ''
  return host.includes('localhost') || url.includes('localhost')
}

function getCookieOptions(maxAge: number, includeDomain = true) {
  const localhost = isLocalhost()
  return {
    httpOnly: true,
    secure: !localhost,
    sameSite: localhost ? ('lax' as const) : ('none' as const),
    path: '/',
    maxAge,
    ...(localhost || !includeDomain ? {} : { domain: '.luisardito.com' }),
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
  cookieStore.set(AUTH_COOKIE, accessToken, getCookieOptions(AUTH_MAX_AGE))
  if (refreshToken) {
    cookieStore.set(REFRESH_COOKIE, refreshToken, getCookieOptions(REFRESH_MAX_AGE))
  }
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies()
  const expires = new Date(0)
  const domainOptions = { ...getCookieOptions(0), expires }
  cookieStore.set(AUTH_COOKIE, "", domainOptions)
  cookieStore.set(REFRESH_COOKIE, "", domainOptions)
  if (!isLocalhost()) {
    const hostOptions = { ...getCookieOptions(0, false), expires }
    cookieStore.set(AUTH_COOKIE, "", hostOptions)
    cookieStore.set(REFRESH_COOKIE, "", hostOptions)
  }
}
