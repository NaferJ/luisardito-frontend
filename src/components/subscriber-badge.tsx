import Image from "next/image"
import { cn } from "@/lib/utils"
import { getSubscriberTier } from "@/lib/subscriber-tiers"

/**
 * Tiered subscriber badge. Renders the badge image for the subscriber's
 * cumulative subscription duration (from Kick's `subscription_duration_months`).
 *
 * The tier thresholds and badge images are defined in `src/lib/subscriber-tiers.ts`
 * — edit that file to change anything about the badges (images, month
 * thresholds, order, add/remove tiers). This component has no hardcoded
 * tier logic.
 *
 * Returns `null` when the user is not a subscriber (duration is 0/null/
 * undefined), so callers can use `{duration != null && <SubscriberBadge ... />}`
 * or just render it unconditionally — it cleans up after itself.
 *
 * Follows the same `size` + `className` prop pattern as `VipBadge`.
 */
export function SubscriberBadge({
  durationMonths,
  size = 16,
  className,
}: Readonly<{
  durationMonths: number | null | undefined
  size?: number
  className?: string
}>) {
  const tier = getSubscriberTier(durationMonths)
  if (!tier) return null

  return (
    <span
      title={tier.alt}
      className={cn("inline-flex shrink-0 cursor-pointer align-middle", className)}
    >
      <Image
        src={tier.badge}
        alt={tier.alt}
        width={size}
        height={size}
      />
    </span>
  )
}
