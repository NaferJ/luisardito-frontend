"use client"

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Gift, Package, Tag, Users, type LucideIcon } from "lucide-react"
import type { Producto } from "@/types"
import { useUser, useUpdateUser } from "@/components/user-provider"
import { cn, formatCompactNumber } from "@/lib/utils"
import { productToCard } from "@/lib/product-mapper"
import { DesignCard } from "@/components/design-card"
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

interface StatRow {
  label: string
  value: string
  icon: LucideIcon
}

/**
 * Build the metadata stat rows shown below the price. Deliberately excludes
 * price/original price — those are already shown prominently in the header
 * line right above, so repeating them here would be redundant information
 * the user has to re-scan for no reason. Also excludes Stock (moved above
 * the title), Redeemed (moved below the title), and Status (admin-only,
 * not relevant to shoppers).
 */
function buildStatRows(product: Producto, hasDiscount: boolean): StatRow[] {
  return [
    ...(hasDiscount
      ? [{ label: "Discount", value: product.descuento!.porcentajeDescuento, icon: Tag }]
      : []),
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

  // Clear result AND cooldown when navigating to a different product. The
  // cooldown is a per-redemption debounce, not a global "wait 5s between any
  // two redemptions" rule — without this, redeeming product A and then
  // arrow-navigating to product B left B's redeem button disabled too, even
  // though the user never touched it.
  // Uses a ref-like comparison so the clear only happens on product change,
  // not immediately after setting a result for the current product.
  if (product?.id !== resultProductId && (result !== null || cooldown > 0)) {
    setResultProductId(product?.id)
    setResult(null)
    setCooldown(0)
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

  const overlayRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleTextRef = useRef<HTMLDivElement>(null)
  const initialHeaderHeightRef = useRef(0)

  useEffect(() => {
    const overlay = overlayRef.current
    const header = headerRef.current
    const title = titleRef.current
    const titleText = titleTextRef.current
    if (!overlay || !header || !title || !titleText) return

    let raf = 0
    const update = () => {
      raf = 0
      const scrollY = overlay.scrollTop
      const initialHeight = initialHeaderHeightRef.current
      const titleThreshold = Math.max(0, initialHeight - 80)

      const newHeight = Math.max(80, initialHeight - scrollY * 0.6)
      header.style.height = `${newHeight}px`
      header.style.minHeight = "0px"

      const titleProgress = Math.min(1, Math.max(0, (scrollY - titleThreshold) / 80))

      title.classList.toggle("bg-background/95", titleProgress > 0.01)
      title.classList.toggle("backdrop-blur-sm", titleProgress > 0.01)
      titleText.style.opacity = String(titleProgress)
    }

    const onScroll = () => {
      if (raf === 0) {
        raf = requestAnimationFrame(update)
      }
    }

    const reset = () => {
      overlay.scrollTop = 0
      header.style.height = ""
      header.style.minHeight = ""
      initialHeaderHeightRef.current = header.clientHeight
      header.style.height = `${initialHeaderHeightRef.current}px`
      header.style.minHeight = "0px"
      titleText.style.opacity = "0"
      title.classList.remove("bg-background/95", "backdrop-blur-sm")
    }

    reset()
    overlay.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      overlay.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [product.id])

  if (!product) return null

  const hasDiscount = product.descuento?.tieneDescuento
  const price = getEffectivePrice(product)
  const originalPrice = getOriginalPrice(product)
  const inStock = product.stock > 0
  const canRedeem = canRedeemProduct(user, product, price)
  const statRows = buildStatRows(product, Boolean(hasDiscount))
  const redeemButtonContent = renderRedeemButtonContent(redeeming, cooldown)
  const canGoPrev = index > 0
  const canGoNext = index < products.length - 1

  return (
    <>
      {/* Mobile / tablet — product detail as a page over a blurred version of
          the product image. The product image is shown full (object-contain)
          and the glass card scrolls over it, with a "More products" grid at
          the bottom so the user can scroll to other products instead of
          tapping arrows. */}
      <div
        ref={overlayRef}
        className="overlay-enter fixed inset-0 z-20 overflow-y-auto lg:hidden"
      >
        {/* Blurred product image fills the background so the page subtly
            takes on the product's colors and the image "bleeds" into the page. */}
        <div className="absolute inset-0 -z-20" aria-hidden="true">
          <Image
            src={product.imagen || product.imagen_url || "/placeholder.svg"}
            alt=""
            fill
            sizes="100vw"
            className="object-cover blur-3xl opacity-40"
            priority
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-background/80" aria-hidden="true" />

        <ProductTitleBar
          titleRef={titleRef}
          titleTextRef={titleTextRef}
          product={product}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onClose={onClose}
          onPrev={() => canGoPrev && onNavigate(index - 1)}
          onNext={() => canGoNext && onNavigate(index + 1)}
        />
        <MobileImageHeader
          key={product.id}
          product={product}
          headerRef={headerRef}
        />
        <div className="relative z-10 flex min-h-[calc(100vh-240px)] flex-col rounded-t-3xl bg-background/75 ring-1 ring-border/20 backdrop-blur-[14px]">
          <div
            key={product.id}
            className="overlay-content flex min-h-0 flex-1 flex-col gap-6 px-5 pt-6 pb-40"
          >
            <ProductInfo
              hasDiscount={Boolean(hasDiscount)}
              product={product}
              price={price}
              originalPrice={originalPrice}
              statRows={statRows}
            />
            <MoreProducts products={products} currentIndex={index} onSelect={onNavigate} />
          </div>
        </div>
      </div>

      {/* CTA is a real `fixed` element, outside the scrollable overlay, so it
          is always on screen and never overlapped by scrolling content
          underneath (position: sticky inside the scroll flow used to overlap
          the "More products" grid once content grew past the sticky item's
          static flow position). */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border/20 bg-background/95 px-5 py-4 pb-[max(env(safe-area-inset-bottom)+2.5rem,2.5rem)] backdrop-blur-md lg:hidden"
      >
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

      {/* Desktop — static metadata sidebar, always opaque. Sits at z-20 so
          the lightbox (z-50) and its blur layer only paint to the right of
          it. The "slide-in" illusion comes from the feed shifting right, not
          the panel moving. Content fades when the product changes. */}
      <aside
        aria-label={product.nombre}
        className="overlay-enter fixed inset-y-0 left-[max(252px,calc(50vw-588px))] z-20 hidden w-[292px] flex-col overflow-hidden bg-background lg:flex"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => canGoPrev && onNavigate(index - 1)}
              disabled={!canGoPrev}
              aria-label="Previous product"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => canGoNext && onNavigate(index + 1)}
              disabled={!canGoNext}
              aria-label="Next product"
              className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
          <div key={product.id} className="overlay-content flex flex-col gap-6">
            <ProductInfo
              hasDiscount={Boolean(hasDiscount)}
              product={product}
              price={price}
              originalPrice={originalPrice}
              statRows={statRows}
            />

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

      <ProductLightbox key={product.id} product={product} />
    </>
  )
}

// ─── Sub-components ───

/** Shared title/price/description/stat-rows block, used by both the mobile
 * sheet and the desktop sidebar so the two layouts never drift apart. */
function ProductInfo({
  hasDiscount,
  product,
  price,
  originalPrice,
  statRows,
}: Readonly<{
  hasDiscount: boolean
  product: Producto
  price: number
  originalPrice: number | null
  statRows: StatRow[]
}>) {
  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Stock above the title — the most important availability info, so
            it gets the prime top position. */}
        <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Package className="size-3.5" aria-hidden="true" />
          <span>{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</span>
        </div>

        <div className="flex flex-col gap-1">
          {hasDiscount ? (
            <span className="text-[13px] text-gold-bright">On Sale</span>
          ) : null}
          <h2 className="text-[17px] font-medium leading-snug text-foreground">{product.nombre}</h2>
          {/* Redeemed count directly below the title — social proof in the
              natural reading position. */}
          <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Users className="size-3.5" aria-hidden="true" />
            <span>{product.canjes_count ? formatCompactNumber(product.canjes_count) : "0"} redeemed</span>
          </div>
        </div>

        {/* Price is the single most important scannable number on this
            panel — largest text here, gold so it reads instantly. Stat rows
            below never repeat it. */}
        <div className="flex items-baseline gap-2">
          <span className="text-[20px] font-semibold leading-none text-gold-bright">
            {formatCompactNumber(price)}
          </span>
          <span className="text-[13px] text-muted-foreground">points</span>
          {originalPrice && (
            <span className="text-[13px] text-muted-foreground line-through">
              {formatCompactNumber(originalPrice)}
            </span>
          )}
        </div>

        <p className="text-[13px] leading-relaxed text-pretty text-foreground">{product.descripcion}</p>
      </div>

      {statRows.length > 0 && (
        <div className="flex flex-col">
          {statRows.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "flex items-center justify-between gap-3 py-2",
                i > 0 && "border-t border-border/30",
              )}
            >
              <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-muted-foreground">
                <row.icon className="size-3.5" aria-hidden="true" />
                {row.label}
              </span>
              <span className="text-right text-[13px] font-medium text-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/** Sticky mobile title bar. Background and product name fade in as the user
 * scrolls past the product image, so the user always knows which product they
 * are viewing without the image taking up screen space. */
function ProductTitleBar({
  titleRef,
  titleTextRef,
  product,
  canGoPrev,
  canGoNext,
  onClose,
  onPrev,
  onNext,
}: Readonly<{
  titleRef: RefObject<HTMLDivElement | null>
  titleTextRef: RefObject<HTMLDivElement | null>
  product: Producto
  canGoPrev: boolean
  canGoNext: boolean
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}>) {
  return (
    <div
      ref={titleRef}
      className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 bg-transparent transition-colors duration-200"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-[colors,transform] duration-150 hover:bg-background/95 active:scale-90"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <div
        ref={titleTextRef}
        className="min-w-0 flex-1 px-8 text-center text-[15px] font-medium text-foreground opacity-0 transition-opacity duration-200"
      >
        {product.nombre}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Previous product"
          className="flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-[colors,transform] duration-150 hover:bg-background/95 active:scale-90 disabled:opacity-40 disabled:hover:bg-background/80"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          aria-label="Next product"
          className="flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur-sm transition-[colors,transform] duration-150 hover:bg-background/95 active:scale-90 disabled:opacity-40 disabled:hover:bg-background/80"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/** Mobile product image header. The whole header shrinks as the user scrolls
 * so the image and its container move together. Matches the desktop lightbox
 * approach: the container uses the image's real aspect ratio (so a square
 * image gets a square box, a wide image gets a wide box), and `object-cover`
 * fills it exactly with no cropping. The width is computed with `min()` so
 * the container fits within both the max width (24rem) and the available
 * header height (40vh minus padding) — landscape images hit the width cap,
 * portrait images hit the height cap. Every image keeps its own proportions
 * but none overflow the header. */
function MobileImageHeader({
  product,
  headerRef,
}: Readonly<{
  product: Producto
  headerRef: RefObject<HTMLDivElement | null>
}>) {
  const imgW = product.imagen_width || 800
  const imgH = product.imagen_height || 600

  // Cloudinary's `e_trim` auto-crops transparent borders from PNGs. Only
  // applied to PNGs because JPGs have no alpha channel — Cloudinary returns
  // 400 if `e_trim` is used on a JPEG. This fixes transparent PNGs that have
  // padding around the actual content (which made them look smaller than
  // other products) without affecting JPGs or adding processing overhead.
  const rawSrc = product.imagen || product.imagen_url || "/placeholder.svg"
  const imageSrc =
    rawSrc.includes("res.cloudinary.com") && rawSrc.toLowerCase().endsWith(".png")
      ? rawSrc.replace("/image/upload/", "/image/upload/e_trim/")
      : rawSrc

  // Width = the smaller of (max width) and (the width that would make the
  // height equal the available header height at this aspect ratio). This
  // fits the container within both constraints while keeping the real ratio.
  const width = `min(24rem, calc((40vh - 2rem) * ${imgW} / ${imgH}))`

  return (
    <div
      ref={headerRef}
      className="relative z-0 flex h-[40vh] min-h-[240px] max-h-[340px] items-center justify-center overflow-hidden px-6 py-4"
    >
      <div
        className="overlay-media relative overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border/50"
        style={{ aspectRatio: `${imgW} / ${imgH}`, width }}
      >
        <Image
          src={imageSrc}
          alt={product.nombre}
          fill
          sizes="(max-width: 640px) 90vw, 384px"
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}

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
          "flex h-10 items-center justify-center gap-2 rounded-full px-6 text-[14px] font-medium transition-[opacity,transform] duration-150 active:scale-[0.97]",
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
          You need {formatCompactNumber(price - user.puntos)} more points
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

function MoreProducts({
  products,
  currentIndex,
  onSelect,
}: Readonly<{
  products: Producto[]
  currentIndex: number
  onSelect: (index: number) => void
}>) {
  return (
    <div className="flex flex-col gap-3 pt-4">
      <h3 className="text-[13px] font-medium text-muted-foreground">More products</h3>
      <div className="grid grid-cols-2 gap-3 [&_article]:mb-0">
        {products.map((p, i) => {
          if (i === currentIndex) return null
          const card = productToCard(p, i)
          return (
            <DesignCard
              key={card.id}
              card={card}
              onOpen={() => onSelect(i)}
              hideBookmark
            />
          )
        })}
      </div>
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
