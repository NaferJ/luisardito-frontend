import { NextResponse, type NextRequest } from 'next/server'

const AUTH_COOKIE = 'auth_token'
const REFRESH_COOKIE = 'refresh_token'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const PROTECTED_ROUTES = [
  '/shop/canjes',
  '/shop/historial',
  '/shop/perfil',
  '/shop/admin',
]

const PUBLIC_ROUTES = ['/shop/auth/callback', '/shop/auth/dev-login']

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function isPublicAuthRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1])) as { exp?: number }
    if (!payload.exp) return true
    return Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

async function refreshTokens(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })
    if (!response.ok) return null
    const data = (await response.json()) as {
      accessToken?: string
      token?: string
      refreshToken?: string
    }
    const accessToken = data.accessToken ?? data.token
    if (!accessToken) return null
    return { accessToken, refreshToken: data.refreshToken }
  } catch {
    return null
  }
}

function buildCookieOptions(isLocalhost: boolean, maxAge: number) {
  return {
    httpOnly: true,
    secure: !isLocalhost,
    sameSite: (isLocalhost ? 'lax' : 'none') as 'lax' | 'none',
    path: '/',
    maxAge,
    ...(isLocalhost ? {} : { domain: '.luisardito.com' }),
  }
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/shop') || isPublicAuthRoute(pathname)) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get(AUTH_COOKIE)?.value

  if (!authToken) {
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(new URL('/shop', request.url))
    }
    return NextResponse.next()
  }

  if (!isJwtExpired(authToken)) {
    return NextResponse.next()
  }

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) {
    if (isProtectedRoute(pathname)) {
      const response = NextResponse.redirect(new URL('/shop', request.url))
      response.cookies.delete(AUTH_COOKIE)
      return response
    }
    return NextResponse.next()
  }

  const refreshed = await refreshTokens(refreshToken)
  if (!refreshed) {
    if (isProtectedRoute(pathname)) {
      const response = NextResponse.redirect(new URL('/shop', request.url))
      response.cookies.delete(AUTH_COOKIE)
      response.cookies.delete(REFRESH_COOKIE)
      return response
    }
    return NextResponse.next()
  }

  const response = NextResponse.next()
  const isLocalhost = request.nextUrl.hostname.includes('localhost')

  response.cookies.set(
    AUTH_COOKIE,
    refreshed.accessToken,
    buildCookieOptions(isLocalhost, 30 * 24 * 60 * 60),
  )

  if (refreshed.refreshToken) {
    response.cookies.set(
      REFRESH_COOKIE,
      refreshed.refreshToken,
      buildCookieOptions(isLocalhost, 90 * 24 * 60 * 60),
    )
  }

  return response
}

export const config = {
  matcher: ['/shop/:path*'],
}
