import { redirect } from 'next/navigation'
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
  const locale = await getRequestLocale()
  const shopUrl = (error?: string) => {
    const query = error ? `?error=${encodeURIComponent(error)}` : ''
    return `/${locale}/shop${query}`
  }

  if (oauthError) {
    redirect(shopUrl(oauthError))
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
        redirect(shopUrl('callback_exchange_failed'))
      }
      tokens = (await response.json()) as TokenResponse
    } else {
      redirect(shopUrl('missing_params'))
    }

    const accessToken = tokens.accessToken ?? tokens.token
    if (!accessToken) {
      redirect(shopUrl('no_token'))
    }

    await setAuthCookies(accessToken, tokens.refreshToken)
    redirect(shopUrl())
  } catch {
    redirect(shopUrl('callback_failed'))
  }
}
