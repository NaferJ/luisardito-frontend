"use client"

import { useEffect, useState, type ReactNode } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Gift } from "lucide-react"
import type { Producto } from "@/types"
import { useUser, useUpdateUser } from "@/components/user-provider"
import { cn } from "@/lib/utils"
import { extractDominantColors } from "@/lib/extract-color"
import { setOverlayColors } from "@/lib/overlay-color-store"

interface RedemptionResult {
  success: boolean
  message: string
}

/** Resolve the effective price for a product, applying any active discount. */
function getEffectivePrice(product: Producto): number {
  const hasDiscount = product.descuento?.tieneDescuento
  return hasDiscount ? product.descuento!.precioFinal : product.precio
}

/** Resolve the original (pre-discount) price, or null when there is no discount. */
function getOriginalPrice(product: Producto): number | null {
  const hasDiscount = product.descuento?.tieneDescuento
  return hasDiscount ? product.descuento!.precioOriginal : null
}

/** Whether the current user may redeem the given product. */
function canRedeemProduct(
  user: ReturnType<typeof useUser>,
  product: Producto,
  price: number,
): boolean {
  const inStock = product.stock > 0
  return user !== null && inStock && user.puntos >= price
}

/** Build the metadata stat rows shown in the sidebar. */
function buildStatRows(
  product: Producto,
  hasDiscount: boolean,
  price: number,
  originalPrice: number | null,
): { label: string; value: string }[] {
  return [
    { label: "Price", value: `${price.toLocaleString()} pts` },
    ...(originalPrice ? [{ label: "Original", value: `${originalPrice.toLocaleString()} pts` }] : []),
    { label: "Stock", value: product.stock > 0 ? String(product.stock) : "Out of stock" },
    { label: "Status", value: product.estado },
    ...(hasDiscount ? [{ label: "Discount", value: product.descuento!.porcentajeDescuento }] : []),
  ]
}

/** Render the redeem button's inner content based on current state. */
function renderRedeemButtonContent(redeeming: boolean, cooldown: number): ReactNode {
  if (redeeming) {
    return (
      <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
    )
  }
  if (cooldown > 0) {
    return (
      <>
        <Gift className="size-4 opacity-50" aria-hidden="true" />
        Canjear ({cooldown}s)
      </>
    )
  }
  return (
    <>
      <Gift className="size-4" aria-hidden="true" />
      Canjear
    </>
  )
}

/** Keyboard navigation + body-scroll lock while the overlay is open. */
function useKeyboardNavigation(
  index: number,
  productsLength: number,
  onClose: () => void,
  onNavigate: (nextIndex: number) => void,
) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < productsLength - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [index, productsLength, onClose, onNavigate])
}

// Drive the side shader's color from the dominant colors of the currently
// open product image. Skips the local placeholder (no useful color to
// sample). Stale results from rapid arrow navigation are ignored via the
// cancelled flag; the store is cleared once when the overlay unmounts.
// SideDecor picks the candidate with the best contrast against the current
// background, so a dark image won't produce an invisible dark shader color.
function useOverlayColors(product: Producto | undefined) {
  const imageSrc = product?.imagen || product?.imagen_url || null
  useEffect(() => {
    if (!imageSrc) return
    let cancelled = false
    extractDominantColors(imageSrc).then((colors) => {
      if (!cancelled) setOverlayColors(colors.length > 0 ? colors : null)
    })
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  useEffect(() => {
    return () => setOverlayColors(null)
  }, [])
}

/** Encapsulates redemption state, the cooldown timer, and the redeem action. */
function useRedeemProduct(
  product: Producto | undefined,
  user: ReturnType<typeof useUser>,
  updateUser: ReturnType<typeof useUpdateUser>,
) {
  const [redeeming, setRedeeming] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [result, setResult] = useState<RedemptionResult | null>(null)
  const [resultProductId, setResultProductId] = useState<number | undefined>(undefined)

  // Clear result when navigating to a different product.
  // Uses a ref-like comparison so the clear only happens on product change,
  // not immediately after setting a result for the current product.
  if (product?.id !== resultProductId && result !== null) {
    setResultProductId(product?.id)
    setResult(null)
  }

  // Countdown timer for the post-redemption cooldown.
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  async function handleRedeem() {
    if (!product) return
    const price = getEffectivePrice(product)
    if (!canRedeemProduct(user, product, price)) return
    setRedeeming(true)
    setResult(null)
    try {
      const response = await fetch("/shop/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productoId: product.id }),
      })
      const data = await response.json()
      if (response.ok) {
        // Set resultProductId HERE so the render-phase clear above
        // doesn't immediately wipe the result we just set.
        setResultProductId(product.id)
        setResult({ success: true, message: "Redemption successful! Check your canjes." })

        // 5-second cooldown to prevent accidental double-redemption.
        setCooldown(5)

        // Optimistically update the user's points so the sidebar
        // reflects the new balance immediately without a page reload.
        const precioPagado = (data as { precio_pagado?: number }).precio_pagado
        if (user && typeof precioPagado === "number") {
          updateUser({ puntos: user.puntos - precioPagado })
        }
      } else {
        setResultProductId(product.id)
        setResult({ success: false, message: data.error || data.message || "Redemption failed" })
      }
    } catch {
      setResultProductId(product.id)
      setResult({ success: false, message: "Network error. Try again." })
    } finally {
      setRedeeming(false)
    }
  }

  return { redeeming, cooldown, result, handleRedeem }
}

export function ProductDetailOverlay({
  products,
  index,
  onClose,
  onNavigate,
}: Readonly<{
  products: Producto[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}>) {
  const user = useUser()
  const updateUser = useUpdateUser()
  const product = products[index]

  useKeyboardNavigation(index, products.length, onClose, onNavigate)
  useOverlayColors(product)

  const { redeeming, cooldown, result, handleRedeem } = useRedeemProduct(
    product,
    user,
    updateUser,
  )

  if (!product) return null

  const hasDiscount = product.descuento?.tieneDescuento
  const price = getEffectivePrice(product)
  const originalPrice = getOriginalPrice(product)
  const inStock = product.stock > 0
  const canRedeem = canRedeemProduct(user, product, price)
  const statRows = buildStatRows(product, Boolean(hasDiscount), price, originalPrice)
  const redeemButtonContent = renderRedeemButtonContent(redeeming, cooldown)

  return (
    <>
      {/* Static metadata sidebar — always opaque, never animated.
          Sits at z-20 so the lightbox (z-50) and its blur layer only paint
          to the right of it (the lightbox media is offset by 292px via a
          spacer). This matches the reference: the panel never moves and
          never goes transparent, so the feed can never show through it.
          The "slide-in" illusion is created by the feed shifting right,
          not by the panel itself moving. */}
      <aside
        aria-label={product.nombre}
        className="fixed inset-y-0 left-0 right-0 z-20 flex flex-col overflow-hidden bg-background lg:left-[max(252px,calc(50vw-588px))] lg:right-auto lg:w-[292px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => index > 0 && onNavigate(index - 1)}
              disabled={index === 0}
              aria-label="Previous product"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => index < products.length - 1 && onNavigate(index + 1)}
              disabled={index === products.length - 1}
              aria-label="Next product"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-muted-foreground">{hasDiscount ? "On Sale" : "Product"}</span>
                <h2 className="text-[15px] font-medium text-foreground">{product.nombre}</h2>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-[15px] font-medium text-gold-bright">{price.toLocaleString()}</span>
                <span className="text-[13px] text-muted-foreground">points</span>
                {originalPrice && (
                  <span className="text-[13px] text-muted-foreground line-through">
                    {originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-[13px] leading-relaxed text-pretty text-foreground">{product.descripcion}</p>
            </div>

            <div className="flex flex-col">
              {statRows.map((row, i) => (
                <div
                  key={row.label}
                  className={cn(
                    "flex items-start justify-between gap-3 py-1.5",
                    i > 0 && "border-t border-border",
                  )}
                >
                  <span className="shrink-0 text-[13px] text-muted-foreground">{row.label}</span>
                  <span className="text-right text-[13px] text-foreground">{row.value}</span>
                </div>
              ))}
            </div>

            <RedeemSection
              user={user}
              inStock={inStock}
              price={price}
              canRedeem={canRedeem}
              redeeming={redeeming}
              cooldown={cooldown}
              result={result}
              buttonContent={redeemButtonContent}
              onRedeem={handleRedeem}
            />
          </div>
        </div>
      </aside>

      <ProductLightbox product={product} />
    </>
  )
}

// ─── Sub-components ───

function RedeemSection({
  user,
  inStock,
  price,
  canRedeem,
  redeeming,
  cooldown,
  result,
  buttonContent,
  onRedeem,
}: Readonly<{
  user: ReturnType<typeof useUser>
  inStock: boolean
  price: number
  canRedeem: boolean
  redeeming: boolean
  cooldown: number
  result: RedemptionResult | null
  buttonContent: ReactNode
  onRedeem: () => void
}>) {
  if (!user) {
    return <p className="text-[13px] text-muted-foreground">Log in to redeem this product.</p>
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={onRedeem}
        disabled={!canRedeem || redeeming || cooldown > 0}
        className={cn(
          "flex h-10 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-medium transition-opacity",
          canRedeem && !redeeming && cooldown === 0
            ? "bg-foreground text-background hover:opacity-85"
            : "bg-secondary text-muted-foreground cursor-not-allowed",
        )}
      >
        {buttonContent}
      </button>
      {!inStock && (
        <span className="text-center text-[12px] text-muted-foreground">Out of stock</span>
      )}
      {inStock && user.puntos < price && (
        <span className="text-center text-[12px] text-muted-foreground">
          You need {(price - user.puntos).toLocaleString()} more points
        </span>
      )}
      {result && (
        <span
          className={cn(
            "text-center text-[12px]",
            result.success ? "text-gold-bright" : "text-muted-foreground",
          )}
        >
          {result.message}
        </span>
      )}
    </div>
  )
}

function ProductLightbox({ product }: Readonly<{ product: Producto }>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.nombre}
      className="fixed inset-y-0 left-0 right-0 z-50 hidden flex-row overflow-hidden pointer-events-none lg:flex lg:left-[max(252px,calc(50vw-588px))] lg:right-[120px]"
    >
      {/* Spacer — reserves the sidebar area so blur/media don't paint there */}
      <div className="hidden lg:block lg:w-[292px] lg:shrink-0" />

      {/* Media + blur area. Blur lives on its own static layer so it always
          paints correctly; only the image content fades + scales in on top. */}
      <div className="relative flex min-w-0 flex-1 items-center justify-center">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-background/70 backdrop-blur-[8px]"
        />
        <div
          className="overlay-media relative w-full max-w-2xl overflow-hidden rounded-sm bg-card shadow-2xl ring-1 ring-border"
          style={
            product.imagen_width && product.imagen_height
              ? { aspectRatio: `${product.imagen_width} / ${product.imagen_height}` }
              : { aspectRatio: "4 / 3" }
          }
        >
          <Image
            src={product.imagen || product.imagen_url || "/placeholder.svg"}
            alt={product.nombre}
            fill
            sizes="672px"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}
