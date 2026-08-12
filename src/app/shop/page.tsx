import { FilterPills } from "@/components/filter-pills"
import { ProductFeed } from "@/components/product-feed"
import { getProducts } from "@/lib/products"

export default async function ShopPage() {
  const products = await getProducts()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Shop</h1>
        <p className="text-[15px] text-muted-foreground">Redeem your points for rewards.</p>
      </div>

      <FilterPills />

      {products.length > 0 ? (
        <ProductFeed products={products} />
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border p-8">
          <p className="text-[13px] text-muted-foreground">
            No products available right now. Check back soon.
          </p>
        </div>
      )}
    </div>
  )
}
