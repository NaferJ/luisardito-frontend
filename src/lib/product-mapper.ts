import type { DesignCardData } from "@/components/design-card"
import type { Producto } from "@/types"

const AVATAR_COLORS = [
  "bg-gold-highlight",
  "bg-gold-bright",
  "bg-gold-deep",
  "bg-gray-medium",
]

export function productToCard(product: Producto, index: number): DesignCardData {
  const hasDiscount = product.descuento?.tieneDescuento
  const price = hasDiscount ? product.descuento!.precioFinal : product.precio

  return {
    id: String(product.id),
    image: product.imagen || product.imagen_url || "/placeholder.svg",
    alt: product.nombre,
    aspect: "aspect-[4/3]",
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    badge: hasDiscount ? "star" : undefined,
    tag: hasDiscount ? "Sale" : "Product",
    title: product.nombre,
    author: `${price.toLocaleString()} pts`,
    description: product.descripcion,
    timeAgo: product.stock > 0 ? `${product.stock} in stock` : "Out of stock",
    impressions: price.toLocaleString(),
    outbound: product.stock,
    source: "Shop",
    category: hasDiscount ? "On Sale" : "Product",
    style: product.estado,
    color: hasDiscount ? `${product.descuento!.porcentajeDescuento} off` : "—",
    interaction: [`${price.toLocaleString()} points`],
  }
}
