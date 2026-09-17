import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { getMyHistorial } from '@/lib/historial'
import { HistorialList } from '@/components/shop/historial-list'
import { dictionaries, getDictionary, hasLocale, type Locale } from '@/lib/i18n'
import { interpolate } from '@/lib/i18n/shared'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return {
    title: dictionaries[locale].historial.metaTitle,
    description: dictionaries[locale].historial.metaDescription,
  }
}

export default async function HistorialPage() {
  const user = await requireAuth()
  const [historial, dictionary] = await Promise.all([
    getMyHistorial(user.id),
    getDictionary(),
  ])

  const subtitle =
    historial.length > 0
      ? interpolate(dictionary.historial.countTemplate, { n: historial.length })
      : dictionary.historial.subtitle

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.historial.title}</h1>
        <p className="text-[15px] text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <HistorialList historial={historial} />
    </div>
  )
}
