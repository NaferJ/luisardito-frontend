"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import Image from "next/image"
import { ArrowUpRight, Star } from "lucide-react"
import { useI18n } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"
import { cn } from "@/lib/utils"

export type DesignCardData = {
  readonly id: string
  readonly image: string
  readonly alt: string
  /** Tailwind aspect-ratio class (fallback when no real dimensions). */
  readonly aspect: string
  /** Inline aspect-ratio style from real image dimensions. Takes precedence over `aspect`. */
  readonly aspectStyle?: { aspectRatio: string }
  readonly avatarColor: string
  readonly badge?: "star" | number
  readonly tag: string
  readonly title: string
  readonly author: string
  readonly description: string
  readonly timeAgo: string
  readonly impressions: string
  readonly outbound: number
  readonly source: string
  readonly category: string
  readonly style: string
  readonly color: string
  readonly interaction: string[]
  /** Last person who redeemed this product (shop cards only). */
  readonly lastRedeemer?: { name: string; avatar?: string } | null
  /** Author avatar image URL (landing cards, when available). */
  readonly avatar?: string
}

function cloudinaryImageLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (!src.includes("res.cloudinary.com") || !src.includes("/image/upload/")) {
    return src
  }
  return src.replace(
    "/image/upload/",
    `/image/upload/f_auto,q_${quality ?? "auto"},c_limit,w_${width}/`,
  )
}

export function DesignCard({
  card,
  onOpen,
  eager = false,
}: Readonly<{
  card: DesignCardData
  onOpen: () => void
  eager?: boolean
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.card
  const cardRef = useRef<HTMLElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const imageSrc = card.image || "/placeholder.svg"
  const [loadImage, setLoadImage] = useState(eager)
  const [loadedImageSrc, setLoadedImageSrc] = useState<string>()
  const imageLoaded = loadedImageSrc === imageSrc
  const aspectStyle = card.aspectStyle

  useEffect(() => {
    if (loadImage) return
    if (eager || !cardRef.current || !("IntersectionObserver" in window)) {
      setLoadImage(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoadImage(true)
          observer.disconnect()
        }
      },
      { rootMargin: "1200px 0px" },
    )
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [eager, loadImage])

  const handleImageSettled = useCallback(() => {
    setLoadedImageSrc(imageSrc)
  }, [imageSrc])

  useEffect(() => {
    if (imageRef.current?.complete) {
      handleImageSettled()
    }
  }, [handleImageSettled])

  let avatarElement: ReactNode
  if (card.lastRedeemer?.avatar) {
    avatarElement = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.lastRedeemer.avatar}
        alt={card.lastRedeemer.name}
        loading="lazy"
        decoding="async"
        className="size-7 rounded-full object-cover ring-1 ring-background/80"
      />
    )
  } else if (card.avatar) {
    avatarElement = (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={card.avatar}
        alt={card.author}
        loading="lazy"
        decoding="async"
        className="size-7 rounded-full object-cover ring-1 ring-background/80"
      />
    )
  } else {
    avatarElement = null
  }

  return (
    <article ref={cardRef} className="mb-3 break-inside-avoid">
      <div
        className={cn(
          "group relative overflow-hidden rounded-sm bg-secondary",
          // Only apply the Tailwind aspect class when there's no inline style.
          aspectStyle ? undefined : card.aspect,
        )}
        style={aspectStyle}
      >
        <Image
          ref={imageRef}
          src={imageSrc}
          alt={card.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          quality={90}
          loader={cloudinaryImageLoader}
          loading={loadImage ? "eager" : "lazy"}
          preload={eager}
          decoding="async"
          className={cn(
            "object-cover transition-opacity duration-200 motion-reduce:transition-none",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={handleImageSettled}
          onError={() => setLoadedImageSrc(imageSrc)}
        />

        {!imageLoaded && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-40 overflow-hidden rounded-sm bg-secondary"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-muted/70 via-secondary to-muted/50 lg:animate-pulse motion-reduce:animate-none" />
            <div className="absolute bottom-3 left-3 h-7 w-20 rounded-full bg-background/35" />
            <div className="absolute bottom-3 right-3 size-7 rounded-full bg-background/35" />
          </div>
        )}

        {/* Main click target — absolute overlay so sibling buttons don't nest */}
        <button
          type="button"
          onClick={onOpen}
          aria-label={interpolate(t.open, { title: card.title })}
          className="absolute inset-0 z-[1] cursor-pointer rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        />

        {/* Star badge (discount / staff pick) — top-left, always visible */}
        {card.badge === "star" && (
          <span className="absolute top-2.5 left-2.5 z-30 flex size-6 items-center justify-center rounded-full bg-gold-core text-background">
            <Star className="size-3.5 fill-current" aria-hidden="true" />
          </span>
        )}

        {/* Number badge (slide count) — top-right, always visible.
            The bookmark button (below) covers it on hover. */}
        {typeof card.badge === "number" && (
          <span className="absolute top-2.5 right-2.5 z-20 flex size-6 items-center justify-center rounded-full bg-foreground text-[12px] font-medium text-background">
            {card.badge}
          </span>
        )}

        {/* Avatar — bottom-left, shown only when a real user/author avatar exists. */}
        {avatarElement && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            {avatarElement}
          </div>
        )}

        {/* Open arrow — bottom-right, always visible */}
        <span className="absolute bottom-2.5 right-2.5 z-10 flex size-7 items-center justify-center rounded-full bg-background/80 text-foreground">
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </span>

        {/* Subtle border overlay — always visible */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 rounded-sm border border-border/70"
        />
      </div>
    </article>
  )
}
