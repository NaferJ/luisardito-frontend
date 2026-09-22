import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { ProfileView } from '@/components/shop/profile-view'
import { dictionaries, getDictionary, hasLocale, type Locale } from '@/lib/i18n'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return {
    title: dictionaries[locale].profile.metaTitle,
    description: dictionaries[locale].profile.metaDescription,
  }
}

export default async function PerfilPage() {
  const [user, dictionary] = await Promise.all([requireAuth(), getDictionary()])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.profile.title}</h1>
        <p className="text-[15px] text-muted-foreground">
          {dictionary.profile.subtitle}
        </p>
      </div>

      <ProfileView user={user} />
    </div>
  )
}
