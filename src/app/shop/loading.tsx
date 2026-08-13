/**
 * Loading state for /shop and /shop/[slug]. Shown by Next.js while the server
 * component fetches products. Mirrors the real feed: header, sort pills row,
 * and masonry cards with the same rounded-sm + bg-secondary + varied aspect
 * ratios + mb-3 styling as DesignCard so the transition to real content is
 * seamless.
 */

// Same ratios as product-mapper.ts, cycled for the skeleton.
const SKELETON_ASPECTS = [
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-square",
  "aspect-[16/10]",
  "aspect-[3/2]",
  "aspect-[4/5]",
  "aspect-[5/4]",
  "aspect-[2/3]",
]

export default function ShopLoading() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Shop</h1>
        <p className="text-[15px] text-muted-foreground">Redeem your points for rewards.</p>
      </div>

      {/* Sort pills + search skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 rounded-full bg-secondary animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-20 rounded bg-secondary animate-pulse" aria-hidden="true" />
          <div className="h-8 w-40 rounded-full border border-border bg-secondary animate-pulse" aria-hidden="true" />
        </div>
      </div>

      {/* Feed skeleton — matches DesignCard: rounded-sm, bg-secondary, varied
          aspect ratios, mb-3, persistent border */}
      <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:break-inside-avoid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`mb-3 w-full overflow-hidden rounded-sm bg-secondary animate-pulse border border-border/70 ${SKELETON_ASPECTS[i % SKELETON_ASPECTS.length]}`}
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  )
}
