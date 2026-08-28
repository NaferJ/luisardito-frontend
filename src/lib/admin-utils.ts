/** Shared admin list constants and helpers used across multiple admin components. */

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number]

export type DatePreset = "all" | "today" | "7d" | "30d" | "90d"

export const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "all", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
]

/** Get the start timestamp for a date preset, or null for "all". */
export function getDateRangeStart(preset: DatePreset): number | null {
  if (preset === "all") return null
  const now = Date.now()
  const ranges: Record<Exclude<DatePreset, "all">, number> = {
    today: 0,
    "7d": 7 * 86400000,
    "30d": 30 * 86400000,
    "90d": 90 * 86400000,
  }
  if (preset === "today") {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }
  return now - ranges[preset]
}

/** Format an ISO date string as "Mon DD, YYYY". */
export function formatDate(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d))
}

/** Format an ISO date string as "Mon DD, YYYY HH:MM". */
export function formatDateTime(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

/** Relative time formatter (e.g. "3m ago", "2h ago", "5d ago"). */
export function relativeTime(d: string): string {
  const diff = Date.now() - new Date(d).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}
