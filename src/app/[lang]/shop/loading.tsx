/**
 * Generic loading state for all /shop/* routes.
 * Kept minimal and neutral so it works for any shop page
 * (feed, canjes, leaderboard, admin, etc.) without flashing
 * a shop-specific skeleton that doesn't match the destination.
 */
export default function ShopLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="size-6 rounded-full border-2 border-border border-t-foreground animate-spin" />
    </div>
  )
}
