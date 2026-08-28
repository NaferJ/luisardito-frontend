import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ShopBrowse } from "@/components/shop-browse"
import { getProducts, getProductBySlug } from "@/lib/products"
import { getTopLeaderboard } from "@/lib/leaderboard"

interface SlugPageProps {
  readonly params: Promise<{ slug: string }>
}

/**
 * Pre-render known product slugs at build time. Products without a slug fall
 * back to their numeric ID, which is also handled by getProductBySlug.
 */
export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((p) => ({ slug: p.slug || String(p.id) }))
}

export async function generateMetadata({ params }: SlugPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: "Product not found — Luisardito Shop" }

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
  const [products, product, leaderboard] = await Promise.all([
    getProducts(),
    getProductBySlug(slug),
    getTopLeaderboard(5),
  ])

  if (!product) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Shop</h1>
        <p className="text-[15px] text-muted-foreground">Redeem your points for rewards.</p>
      </div>

      <ShopBrowse
        products={products}
        leaderboard={leaderboard}
        initialOpenSlug={product.slug || String(product.id)}
      />
    </div>
  )
}
