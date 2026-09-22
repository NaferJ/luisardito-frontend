import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ShopBrowse } from "@/components/shop-browse"
import { getProducts, getProductBySlug } from "@/lib/products"
import { getTopLeaderboard } from "@/lib/leaderboard"
import { getDictionary, hasLocale, type Locale } from "@/lib/i18n"

interface SlugPageProps {
  readonly params: Promise<{ lang: string; slug: string }>
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const title = `${product.nombre} — Luisardito Shop`
  const description = product.descripcion.slice(0, 160)
  const image = product.imagen || product.imagen_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
  }
}

export default async function ProductSlugPage({ params }: SlugPageProps) {
  const { slug } = await params

  // Fetch all products for the feed + the specific product for validation.
  // Both run in parallel; if the slug doesn't resolve, 404.
  const [products, product, leaderboard, dictionary] = await Promise.all([
    getProducts(),
    getProductBySlug(slug),
    getTopLeaderboard(5),
    getDictionary(),
  ])

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.shop.title}</h1>
        <p className="text-[15px] text-muted-foreground">{dictionary.shop.subtitle}</p>
      </div>

      <ShopBrowse
        products={products}
        leaderboard={leaderboard}
        initialOpenSlug={product.slug || String(product.id)}
      />
    </div>
  )
}
