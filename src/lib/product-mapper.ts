import type { DesignCardData } from "@/components/design-card"
import type { Producto } from "@/types"
import type { Dictionary } from "@/lib/i18n/shared"
import { interpolate } from "@/lib/i18n/shared"
import { formatCompactNumber } from "@/lib/utils"

const AVATAR_COLORS = [
  "bg-gold-highlight",
  "bg-gold-bright",
  "bg-gold-deep",
  "bg-gray-medium",
]

// Varied aspect ratios for a masonry-style feed, matching the recent.design
// reference pattern where each card has its own ratio. Used as a fallback
// when the product's real image dimensions are not available.
const ASPECT_RATIOS = [
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[16/10]",
  "aspect-[3/2]",
  "aspect-[4/5]",
  "aspect-[5/4]",
  "aspect-[2/3]",
]

export function productToCard(
  product: Producto,
  index: number,
  labels: Dictionary["card"],
): DesignCardData {
  const hasDiscount = product.descuento?.tieneDescuento
  const price = hasDiscount ? product.descuento!.precioFinal : product.precio

  // Use real image dimensions when available (from Cloudinary upload, stored
  // on the backend). Falls back to cycled ratios for products without them.
  const hasRealDimensions =
    product.imagen_width != null &&
    product.imagen_height != null &&
    product.imagen_width > 0 &&
    product.imagen_height > 0

  // Map ultimo_canje to the card's lastRedeemer for the bottom-left avatar.
  const uc = product.ultimo_canje
  const lastRedeemer = uc
    ? {
        name: uc.display_name || uc.nickname,
        avatar: uc.kick_data?.avatar_url || uc.avatar || undefined,
      }
    : null

  return {
    id: String(product.id),
    image: product.imagen || product.imagen_url || "/placeholder.svg",
    alt: product.nombre,
    aspect: ASPECT_RATIOS[index % ASPECT_RATIOS.length],
    aspectStyle: hasRealDimensions
      ? { aspectRatio: `${product.imagen_width} / ${product.imagen_height}` }
      : undefined,
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    badge: hasDiscount ? "star" : undefined,
    tag: hasDiscount ? labels.sale : labels.product,
    title: product.nombre,
    author: `${formatCompactNumber(price)} pts`,
    description: product.descripcion,
    timeAgo:
      product.stock > 0
        ? interpolate(labels.inStock, { n: product.stock })
        : labels.outOfStock,
    impressions: formatCompactNumber(price),
    outbound: product.stock,
    source: labels.shop,
    category: hasDiscount ? labels.onSale : labels.product,
    style: product.estado,
    color: hasDiscount
      ? interpolate(labels.percentOff, {
          percent: product.descuento!.porcentajeDescuento,
        })
      : "—",
    interaction: [
      interpolate(labels.pointsLabel, { n: formatCompactNumber(price) }),
    ],
    lastRedeemer,
  }
}
