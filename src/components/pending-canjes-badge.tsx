"use client"

import { useEffect, useState } from "react"

/** Custom event name used to trigger an immediate badge refresh. */
export const CANJES_STATUS_CHANGED = "canjes-status-changed"

/**
 * Polls /shop/api/canjes/pending-count every 60s and renders a small
 * gold badge with the pending count. Only renders when count > 0.
 * Also listens for a custom DOM event dispatched by the admin canjes
 * list when a status change happens, so the badge updates instantly
 * without waiting for the next poll cycle.
 */
export function PendingCanjesBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    const fetchCount = async () => {
      try {
        const res = await fetch("/shop/api/canjes/pending-count", { cache: "no-store" })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setCount(data.count ?? 0)
      } catch {
        // Silent fail — badge is non-critical
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 60_000)

    // Listen for instant updates from the admin canjes list
    const onStatusChanged = () => fetchCount()
    window.addEventListener(CANJES_STATUS_CHANGED, onStatusChanged)

    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener(CANJES_STATUS_CHANGED, onStatusChanged)
    }
  }, [])

  if (count === 0) return null

  return (
    <span
      className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-gold-foreground"
      aria-label={`${count} pending redemptions`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
