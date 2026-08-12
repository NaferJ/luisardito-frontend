import { redirect } from 'next/navigation'
import { setAuthCookies } from '@/lib/cookies'
import { API_BASE_URL } from '@/lib/api'

export const dynamic = 'force-dynamic'

export default async function DevLoginPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/shop')
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-lg font-medium text-foreground">Dev Login</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Development only. Login with nickname and password.
          </p>
        </div>

        <form action={devLoginAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nickname" className="text-[13px] text-muted-foreground">
              Nickname
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              placeholder="tu_nickname"
              className="h-10 rounded-lg border border-border bg-card px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] text-muted-foreground">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="h-10 rounded-lg border border-border bg-card px-3 text-[14px] text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <button
            type="submit"
            className="h-10 rounded-full bg-foreground px-6 text-[14px] font-medium text-background transition-opacity hover:opacity-85"
          >
            Entrar (DEV)
          </button>
        </form>
      </div>
    </div>
  )
}

async function devLoginAction(formData: FormData): Promise<void> {
  'use server'
  if (process.env.NODE_ENV === 'production') {
    redirect('/shop')
  }

  const nickname = formData.get('nickname')
  const password = formData.get('password')

  if (typeof nickname !== 'string' || typeof password !== 'string') {
    redirect('/shop/auth/dev-login?error=missing_fields')
  }

  const result = await tryLogin(nickname, password)

  if (result.error) {
    redirect(`/shop/auth/dev-login?error=${result.error}`)
  }

  if (!result.accessToken) {
    redirect('/shop/auth/dev-login?error=no_token')
  }

  await setAuthCookies(result.accessToken, result.refreshToken)
  redirect('/shop')
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

    const data = (await response.json()) as {
      accessToken?: string
      token?: string
      refreshToken?: string
    }

    return {
      accessToken: data.accessToken ?? data.token,
      refreshToken: data.refreshToken,
    }
  } catch {
    return { error: 'login_failed' }
  }
}
