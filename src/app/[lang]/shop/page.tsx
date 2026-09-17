import { ShopBrowse } from "@/components/shop-browse"
import { getProducts } from "@/lib/products"
import { getTopLeaderboard } from "@/lib/leaderboard"
import { getDictionary } from "@/lib/i18n"

export default async function ShopPage() {
  const [products, leaderboard, dictionary] = await Promise.all([getProducts(), getTopLeaderboard(5), getDictionary()])
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.shop.title}</h1>
        <p className="text-[15px] text-muted-foreground">{dictionary.shop.subtitle}</p>
      </div>
      <ShopBrowse products={products} leaderboard={leaderboard} />
    </div>
  )
}
