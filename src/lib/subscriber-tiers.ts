/**
 * Subscriber badge tier definitions.
 *
 * This is the single source of truth for subscriber badge tiers. To change
 * anything about the badges — swap an image, change a month threshold,
 * reorder, or add more tiers — edit only this array. The `SubscriberBadge`
 * component reads from here and has no hardcoded tier logic.
 *
 * `months` is the minimum cumulative subscription duration (from
 * `subscription_duration_months`) required to reach this tier. The array
 * must be sorted ascending by `months` — the component picks the highest
 * tier whose `months` threshold the user has reached.
 *
 * `badge` is the path (relative to `public/`) to the badge image for that
 * tier. Drop the images in `public/badges/subscriber/`.
 *
 * `alt` is the accessibility label for the badge image.
 */
export interface SubscriberTier {
  readonly months: number
  readonly badge: string
  readonly alt: string
}

export const subscriberTiers: readonly SubscriberTier[] = [
  { months: 1, badge: "/badges/subscriber/tier-1.svg", alt: "1 month subscriber" },
  { months: 2, badge: "/badges/subscriber/tier-2.svg", alt: "2 month subscriber" },
  { months: 3, badge: "/badges/subscriber/tier-3.svg", alt: "3 month subscriber" },
  { months: 4, badge: "/badges/subscriber/tier-4.svg", alt: "4 month subscriber" },
  { months: 5, badge: "/badges/subscriber/tier-5.svg", alt: "5 month subscriber" },
  { months: 6, badge: "/badges/subscriber/tier-6.svg", alt: "6+ month subscriber" },
]

/**
 * Returns the tier a subscriber with the given cumulative months belongs to,
 * or `null` if the duration is 0/null/undefined (not a subscriber).
 *
 * Picks the highest tier whose `months` threshold the user has reached.
 * Values at or above the last tier's threshold cap at that tier (e.g. 8
 * months with a max tier of 6 returns tier 6).
 */
export function getSubscriberTier(months: number | null | undefined): SubscriberTier | null {
  if (!months || months <= 0) return null
  let result: SubscriberTier | null = null
  for (const tier of subscriberTiers) {
    if (months >= tier.months) result = tier
    else break
  }
  return result
}
