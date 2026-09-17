import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getActivePromociones } from '@/lib/promociones'
import { PromocionesGrid } from '@/components/shop/promociones-grid'
import {
  dictionaries,
  getDictionary,
  hasLocale,
  type Locale,
} from '@/lib/i18n'
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
    title: dictionaries[locale].promociones.metaTitle,
    description: dictionaries[locale].promociones.metaDescription,
  }
}

export default async function PromocionesPage() {
  const dictionary = await getDictionary()
  const promociones = await getActivePromociones()

  let subtitle = dictionary.promociones.subtitle
  if (promociones.length > 0) {
    const template =
      promociones.length === 1
        ? dictionary.promociones.activeOne
        : dictionary.promociones.activeMany
    subtitle = interpolate(template, { n: promociones.length })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.promociones.title}</h1>
        <p className="text-[15px] text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <PromocionesGrid promociones={promociones} />
    </div>
  )
}
