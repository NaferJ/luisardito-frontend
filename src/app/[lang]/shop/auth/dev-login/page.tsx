import { redirect } from 'next/navigation'
import { getDictionary } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function DevLoginPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/shop')
  }
  const dictionary = await getDictionary()
  const t = dictionary.devLogin

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="text-center">
          <h1 className="text-lg font-medium text-foreground">{t.title}</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {t.subtitle}
          </p>
        </div>

        <form action="/shop/auth/dev-login" method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nickname" className="text-[13px] text-muted-foreground">
              {t.username}
            </label>
            <input
              id="nickname"
              name="nickname"
              type="text"
              required
              placeholder={t.usernamePlaceholder}
              className="h-10 rounded-lg border border-border bg-card px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-[13px] text-muted-foreground">
              {t.password}
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
            {t.submit}
          </button>
        </form>
      </div>
    </div>
  )
}
