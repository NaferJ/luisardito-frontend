import type { Metadata } from 'next'
import { SiteShell } from '@/components/site-shell'
import { dictionaries, hasLocale, type Locale } from '@/lib/i18n'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return {
    title: locale === 'es' ? 'Tienda Luisardito — Recompensas' : 'Luisardito Shop — Rewards',
    description: dictionaries[locale].shop.subtitle,
  }
}

export default function ShopLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>
}
