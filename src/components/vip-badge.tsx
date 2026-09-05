import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * Kick's official VIP badge icon, used instead of the literal text "VIP".
 * The SVG uses two gradient-filled paths (gold + red) to match the Kick
 * platform's identity badge. Unique gradient IDs are generated per instance
 * via useId() to avoid collisions when multiple badges render on the same
 * page (e.g. the Top earners list with several VIP users).
 */
export function VipBadge({
  className,
  size = 16,
}: Readonly<{
  className?: string
  size?: number
}>) {
  const reactId = useId()
  // useId returns something like ":r1:" which is invalid in a URL/SVG id,
  // so we sanitize it.
  const uid = reactId.replace(/[:]/g, "")
  const idA = `vip-badge-gold-${uid}`
  const idB = `vip-badge-red-${uid}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      className={cn("inline-block shrink-0 cursor-pointer align-middle", className)}
      aria-label="VIP"
      role="img"
      title="VIP"
    >
      <path
        fill={`url(#${idA})`}
        fillRule="evenodd"
        d="M17.88 1C18.5 1 19 1.5 19 2.13v15.75c0 .62-.5 1.12-1.12 1.12H2.13C1.5 19 1 18.5 1 17.88V2.13C1 1.5 1.5 1 2.13 1zm-7.9 2.81a.6.6 0 0 0-.53.32L6.53 9.45 3 7.69a.6.6 0 0 0-.64.07.6.6 0 0 0-.22.62l1.44 6.75q.04.22.21.36a.6.6 0 0 0 .4.13h11.58a.6.6 0 0 0 .38-.13.6.6 0 0 0 .22-.36l1.49-6.75a.6.6 0 0 0-.22-.64.6.6 0 0 0-.65-.06l-3.56 1.77-2.92-5.32a1 1 0 0 0-.23-.23 1 1 0 0 0-.3-.09"
        clipRule="evenodd"
      />
      <path
        fill={`url(#${idB})`}
        fillRule="evenodd"
        d="M17.88 1C18.5 1 19 1.5 19 2.13v15.75c0 .62-.5 1.12-1.12 1.12H2.13C1.5 19 1 18.5 1 17.88V2.13C1 1.5 1.5 1 2.13 1zm-7.9 2.81a.6.6 0 0 0-.53.32L6.53 9.45 3 7.69a.6.6 0 0 0-.64.07.6.6 0 0 0-.22.62l1.44 6.75q.04.22.21.36a.6.6 0 0 0 .4.13h11.58a.6.6 0 0 0 .38-.13.6.6 0 0 0 .22-.36l1.49-6.75a.6.6 0 0 0-.22-.64.6.6 0 0 0-.65-.06l-3.56 1.77-2.92-5.32a1 1 0 0 0-.23-.23 1 1 0 0 0-.3-.09"
        clipRule="evenodd"
      />
      <defs>
        <linearGradient id={idA} x1="11.58" x2="2.62" y1="-6.16" y2="23" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6a4a" />
          <stop offset="1" stopColor="#c70c00" />
        </linearGradient>
        <linearGradient id={idB} x1="9.86" x2="10.18" y1="-1.68" y2="22.98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffc900" />
          <stop offset=".99" stopColor="#ff9500" />
        </linearGradient>
      </defs>
    </svg>
  )
}
