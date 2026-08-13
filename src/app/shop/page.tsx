import { ShopBrowse } from "@/components/shop-browse"
import { getProducts } from "@/lib/products"
import { getTopLeaderboard } from "@/lib/leaderboard"

export default async function ShopPage() {
  const [products, leaderboard] = await Promise.all([
    getProducts(),
    getTopLeaderboard(5),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Shop</h1>
        <p className="text-[15px] text-muted-foreground">Redeem your points for rewards.</p>
      </div>

      <ShopBrowse products={products} leaderboard={leaderboard} />
    </div>
  )
}
