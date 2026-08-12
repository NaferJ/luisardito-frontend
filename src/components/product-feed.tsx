"use client"

import { useState } from "react"
import { DesignCard } from "@/components/design-card"
import { ProductDetailOverlay } from "@/components/product-detail-overlay"
import { productToCard } from "@/lib/product-mapper"
import { cn } from "@/lib/utils"
import type { Producto } from "@/types"

export function ProductFeed({ products }: { products: Producto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const cards = products.map((p, i) => productToCard(p, i))

  return (
    <>
      {/* When a product is open, the feed shifts right by 292px to uncover
          the static metadata sidebar. The sidebar itself never moves —
          this shift is what creates the "panel sliding in from the left"
          illusion, matching the reference. */}
      <div
        className={cn(
          "columns-2 gap-4 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] sm:columns-3 lg:columns-4 [&>*]:break-inside-avoid motion-reduce:transition-none",
          openIndex !== null && "lg:translate-x-[292px]",
        )}
      >
        {cards.map((card, i) => (
          <DesignCard key={card.id} card={card} onOpen={() => setOpenIndex(i)} />
        ))}
      </div>

      {openIndex !== null && (
        <ProductDetailOverlay
          products={products}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </>
  )
}
