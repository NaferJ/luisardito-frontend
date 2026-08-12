"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Gift } from "lucide-react"
import type { Producto } from "@/types"
import { useUser } from "@/components/user-provider"
import { cn } from "@/lib/utils"

export function ProductDetailOverlay({
  products,
  index,
  onClose,
  onNavigate,
}: {
  products: Producto[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}) {
  const user = useUser()
  const [redeeming, setRedeeming] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const [resultProductId, setResultProductId] = useState<number | undefined>(undefined)
  const product = products[index]

  if (product?.id !== resultProductId && result !== null) {
    setResultProductId(product?.id)
    setResult(null)
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < products.length - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [index, products.length, onClose, onNavigate])

  if (!product) return null

  const hasDiscount = product.descuento?.tieneDescuento
  const price = hasDiscount ? product.descuento!.precioFinal : product.precio
  const originalPrice = hasDiscount ? product.descuento!.precioOriginal : null
  const inStock = product.stock > 0
  const canRedeem = user !== null && inStock && user.puntos >= price

  const statRows = [
    { label: "Price", value: `${price.toLocaleString()} pts` },
    ...(originalPrice ? [{ label: "Original", value: `${originalPrice.toLocaleString()} pts` }] : []),
    { label: "Stock", value: product.stock > 0 ? String(product.stock) : "Out of stock" },
    { label: "Status", value: product.estado },
    ...(hasDiscount ? [{ label: "Discount", value: product.descuento!.porcentajeDescuento }] : []),
  ]

  async function handleRedeem() {
    if (!product || !canRedeem) return
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
        setResult({ success: true, message: "Redemption successful! Check your canjes." })
      } else {
        setResult({ success: false, message: data.error || data.message || "Redemption failed" })
      }
    } catch {
      setResult({ success: false, message: "Network error. Try again." })
    } finally {
      setRedeeming(false)
    }
  }

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

            {user ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleRedeem}
                  disabled={!canRedeem || redeeming}
                  className={cn(
                    "flex h-10 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-medium transition-opacity",
                    canRedeem && !redeeming
                      ? "bg-foreground text-background hover:opacity-85"
                      : "bg-secondary text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {redeeming ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    <>
                      <Gift className="size-4" aria-hidden="true" />
                      Canjear
                    </>
                  )}
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
            ) : (
              <p className="text-[13px] text-muted-foreground">Log in to redeem this product.</p>
            )}
          </div>
        </div>
      </aside>

      {/* Lightbox: covers the overlay area but the blur + media are offset
          right by a 292px spacer so they never paint behind the sidebar.
          The container is pointer-events-none so only the media card
          captures interactions. */}
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
          <div className="overlay-media relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-sm bg-card shadow-2xl ring-1 ring-border">
            <Image
              src={product.imagen || product.imagen_url || "/placeholder.svg"}
              alt={product.nombre}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </>
  )
}
