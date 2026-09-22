import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api'
import { setAuthCookies } from '@/lib/cookies'
import { getRequestLocale } from '@/lib/i18n/request-locale'

interface TokenResponse {
  accessToken?: string
  token?: string
  refreshToken?: string
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const encodedData = searchParams.get('data')
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const oauthError = searchParams.get('error')
  const locale = await getRequestLocale(request)
  const redirectToShop = (error?: string) => {
    const query = error ? `?error=${encodeURIComponent(error)}` : ''
    return NextResponse.redirect(new URL(`/${locale}/shop${query}`, request.url), 303)
  }

  if (oauthError) {
    return redirectToShop(oauthError)
  }

  let tokens: TokenResponse = {}

  try {
    if (encodedData) {
      const decoded = JSON.parse(atob(encodedData)) as TokenResponse
      tokens = decoded
    } else if (code && state) {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/kick-callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
        { cache: 'no-store' },
      )
      if (!response.ok) {
        return redirectToShop('callback_exchange_failed')
      }
      tokens = (await response.json()) as TokenResponse
    } else {
      return redirectToShop('missing_params')
    }

    const accessToken = tokens.accessToken ?? tokens.token
    if (!accessToken) {
      return redirectToShop('no_token')
    }

    await setAuthCookies(accessToken, tokens.refreshToken)
    return redirectToShop()
  } catch {
    return redirectToShop('callback_failed')
  }
}
