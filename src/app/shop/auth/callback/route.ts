import { redirect } from 'next/navigation'
import { API_BASE_URL } from '@/lib/api'
import { setAuthCookies } from '@/lib/cookies'

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

  if (oauthError) {
    redirect(`/shop/login?error=${encodeURIComponent(oauthError)}`)
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
        redirect('/shop/login?error=callback_exchange_failed')
      }
      tokens = (await response.json()) as TokenResponse
    } else {
      redirect('/shop/login?error=missing_params')
    }

    const accessToken = tokens.accessToken ?? tokens.token
    if (!accessToken) {
      redirect('/shop/login?error=no_token')
    }

    await setAuthCookies(accessToken, tokens.refreshToken)
    redirect('/shop')
  } catch {
    redirect('/shop/login?error=callback_failed')
  }
}
