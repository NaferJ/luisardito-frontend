import { NextResponse, type NextRequest } from 'next/server'
import {
  appendExpiredCookie,
  getRequestHostContext,
  publicPathUrl,
  type RequestHostContext,
} from '@/lib/request-url'

const AUTH_COOKIE = 'auth_token'
const REFRESH_COOKIE = 'refresh_token'
const LOCALE_COOKIE = 'NEXT_LOCALE'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const LOCALES = ['es', 'en'] as const
const DEFAULT_LOCALE = 'es'
const PROTECTED_ROUTES = ['/shop/canjes', '/shop/historial', '/shop/perfil', '/shop/admin']

function isLocale(value: string): value is (typeof LOCALES)[number] {
  return LOCALES.includes(value as (typeof LOCALES)[number])
}

function detectLocale(request: NextRequest) {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && isLocale(cookie)) return cookie
  const accepted = request.headers.get('accept-language')?.toLowerCase() ?? ''
  return accepted.split(',').some((value) => value.trim().startsWith('en')) ? 'en' : DEFAULT_LOCALE
}

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

function isJwtExpired(token: string) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    const payload = JSON.parse(atob(parts[1])) as { exp?: number }
    return !payload.exp || Date.now() >= payload.exp * 1000
  } catch {
    return true
  }
}

async function refreshTokens(refreshToken: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }), cache: 'no-store',
    })
    if (!response.ok) return null
    const data = (await response.json()) as { accessToken?: string; token?: string; refreshToken?: string }
    const accessToken = data.accessToken ?? data.token
    return accessToken ? { accessToken, refreshToken: data.refreshToken } : null
  } catch {
    return null
  }
}

function cookieOptions(context: RequestHostContext, maxAge: number, includeDomain = true) {
  return {
    httpOnly: true,
    secure: context.secure,
    sameSite: (context.secure ? 'none' : 'lax') as 'lax' | 'none',
    path: '/',
    maxAge,
    ...(includeDomain && context.cookieDomain ? { domain: context.cookieDomain } : {}),
  }
}

function expireCookie(response: NextResponse, name: string, context: RequestHostContext) {
  appendExpiredCookie(response, name, context)
}

function localeRedirect(request: NextRequest, locale: string) {
  const path = `/${locale}${request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname}${request.nextUrl.search}`
  const response = NextResponse.redirect(publicPathUrl(request, path))
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl
  const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
  const lastDot = lastSegment.lastIndexOf('.')
  const hasFileExtension = lastDot !== -1 && lastDot < lastSegment.length - 1
  if (pathname.startsWith('/_next') || pathname === '/favicon.ico' || hasFileExtension) return NextResponse.next()
  if (pathname.startsWith('/shop/api/') || pathname.startsWith('/shop/auth/')) return NextResponse.next()

  const firstSegment = pathname.split('/')[1]
  if (!isLocale(firstSegment)) return localeRedirect(request, detectLocale(request))

  const locale = firstSegment
  const normalizedPath = pathname.slice(`/${locale}`.length) || '/'
  if (normalizedPath === '/auth/callback') {
    const response = NextResponse.redirect(
      publicPathUrl(request, `/shop/auth/callback${request.nextUrl.search}`),
    )
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }
  if (!normalizedPath.startsWith('/shop')) {
    const response = NextResponse.next()
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
    return response
  }

  const authToken = request.cookies.get(AUTH_COOKIE)?.value
  const context = getRequestHostContext(request.headers)
  const redirectToShop = () =>
    NextResponse.redirect(publicPathUrl(request, `/${locale}/shop`))
  if (!authToken) return isProtectedRoute(normalizedPath) ? redirectToShop() : NextResponse.next()
  if (!isJwtExpired(authToken)) return NextResponse.next()

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!refreshToken) {
    if (!isProtectedRoute(normalizedPath)) return NextResponse.next()
    const response = redirectToShop()
    expireCookie(response, AUTH_COOKIE, context)
    return response
  }
  const refreshed = await refreshTokens(refreshToken)
  if (!refreshed) {
    if (!isProtectedRoute(normalizedPath)) return NextResponse.next()
    const response = redirectToShop()
    expireCookie(response, AUTH_COOKIE, context)
    expireCookie(response, REFRESH_COOKIE, context)
    return response
  }
  const response = NextResponse.next()
  response.cookies.set(AUTH_COOKIE, refreshed.accessToken, cookieOptions(context, 30 * 24 * 60 * 60))
  if (refreshed.refreshToken) response.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, cookieOptions(context, 90 * 24 * 60 * 60))
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  return response
}

export const config = { matcher: ['/((?!_next|favicon.ico).*)'] }
