import { NextResponse } from 'next/server'
import { setAuthCookies } from '@/lib/cookies'
import { API_BASE_URL } from '@/lib/api'
import { getRequestLocale } from '@/lib/i18n/request-locale'
import { publicPathUrl } from '@/lib/request-url'

interface LoginResponse {
  accessToken?: string
  token?: string
  refreshToken?: string
}

export async function POST(request: Request): Promise<Response> {
  const locale = await getRequestLocale(request)
  const redirectTo = (path: string) =>
    NextResponse.redirect(publicPathUrl(request, path), 303)
  const devLoginUrl = (error: string) =>
    `/${locale}/shop/auth/dev-login?error=${encodeURIComponent(error)}`

  if (process.env.NODE_ENV === 'production') {
    return redirectTo(`/${locale}/shop`)
  }

  const formData = await request.formData().catch(() => null)
  const nickname = formData?.get('nickname')
  const password = formData?.get('password')

  if (typeof nickname !== 'string' || typeof password !== 'string') {
    return redirectTo(devLoginUrl('missing_fields'))
  }

  const result = await tryLogin(nickname, password)

  if (result.error) {
    return redirectTo(devLoginUrl(result.error))
  }

  if (!result.accessToken) {
    return redirectTo(devLoginUrl('no_token'))
  }

  await setAuthCookies(result.accessToken, result.refreshToken)
  return redirectTo(`/${locale}/shop`)
}

async function tryLogin(
  nickname: string,
  password: string,
): Promise<{ accessToken?: string; refreshToken?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, password }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return { error: 'invalid_credentials' }
    }

    const data = (await response.json()) as LoginResponse

    return {
      accessToken: data.accessToken ?? data.token,
      refreshToken: data.refreshToken,
    }
  } catch {
    return { error: 'login_failed' }
  }
}
