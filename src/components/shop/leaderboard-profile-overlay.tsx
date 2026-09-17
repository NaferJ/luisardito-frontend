"use client"

import { useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { SubscriberBadge } from "@/components/subscriber-badge"
import { VipBadge } from "@/components/vip-badge"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { cn, formatCompactNumber } from "@/lib/utils"

function entryName(entry: LeaderboardEntry): string {
  return entry.kick_data?.username ?? entry.display_name ?? entry.nickname ?? "Anonymous"
}

function entryAvatar(entry: LeaderboardEntry): string | undefined {
  return entry.kick_data?.avatar_url ?? undefined
}

function formatWatchtime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "0m"
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

function movementText(entry: LeaderboardEntry): string {
  if (entry.change_indicator === "new") return "New to the ranking"
  if (entry.change_indicator === "neutral") return "No position change"
  const direction = entry.change_indicator === "up" ? "Up" : "Down"
  const unit = entry.position_change === 1 ? "place" : "places"
  return `${direction} ${entry.position_change} ${unit}`
}

function ProfileImage({
  name,
  avatar,
}: Readonly<{
  name: string
  avatar?: string
}>) {
  return (
    <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-sm">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="size-full object-contain" />
      ) : (
        <span className="text-7xl font-semibold text-foreground">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

export function LeaderboardProfileOverlay({
  entries,
  index,
  onClose,
  onNavigate,
}: Readonly<{
  entries: LeaderboardEntry[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}>) {
  const entry = entries[index]

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (event.key === "ArrowRight" && index < entries.length - 1) onNavigate(index + 1)
    }

    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [entries.length, index, onClose, onNavigate])

  if (!entry) return null

  const name = entryName(entry)
  const avatar = entryAvatar(entry)
  const canGoPrevious = index > 0
  const canGoNext = index < entries.length - 1
  const statRows = [
    { label: "Position", value: `#${entry.position}` },
    { label: "Points", value: formatCompactNumber(entry.puntos) },
    { label: "Peak points", value: formatCompactNumber(entry.max_puntos ?? 0) },
    { label: "Watch time", value: formatWatchtime(entry.watchtime_minutes) },
    { label: "Movement", value: movementText(entry) },
    { label: "Previous position", value: entry.previous_position ? `#${entry.previous_position}` : "—" },
    { label: "Previous points", value: entry.previous_points == null ? "—" : formatCompactNumber(entry.previous_points) },
  ]

  const identity = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">Rank #{entry.position}</span>
        <h2 id="leaderboard-profile-title" className="text-[17px] font-medium text-foreground">{name}</h2>
        {entry.display_name && entry.display_name !== name && (
          <span className="text-[12px] text-muted-foreground">{entry.display_name}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {entry.is_subscriber && <SubscriberBadge durationMonths={entry.subscription_duration_months} size={25} />}
        {Boolean(entry.is_vip) && <VipBadge size={25} />}
      </div>
    </div>
  )

  return (
    <>
      <dialog
        open
        aria-labelledby="leaderboard-profile-title"
        className="overlay-enter fixed inset-y-0 left-0 right-0 z-50 m-0 flex flex-col overflow-hidden border-0 bg-background p-0 lg:left-[max(252px,calc(50vw-588px))] lg:right-auto lg:w-[292px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button type="button" onClick={onClose} aria-label="Close" className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90">
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => canGoPrevious && onNavigate(index - 1)} disabled={!canGoPrevious} aria-label="Previous user" className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => canGoNext && onNavigate(index + 1)} disabled={!canGoNext} aria-label="Next user" className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary">
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
          <div key={entry.usuario_id} className="overlay-content flex flex-col gap-6">
            {identity}
            <div className="flex flex-col">
              {statRows.map((row, rowIndex) => (
                <div key={row.label} className={cn("flex items-start justify-between gap-3 py-2", rowIndex > 0 && "border-t border-border/30")}>
                  <span className="shrink-0 text-[12px] text-muted-foreground">{row.label}</span>
                  <span className="text-right text-[12px] font-medium text-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </dialog>

      <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 hidden flex-row overflow-hidden lg:flex lg:left-[max(252px,calc(50vw-588px))] lg:right-[120px]">
        <div className="w-[292px] shrink-0" />
        <div className="relative flex min-w-0 flex-1 items-center justify-center p-8">
          <div aria-hidden="true" className="absolute inset-0 bg-background/75 backdrop-blur-[8px]" />
          <div className="overlay-media pointer-events-auto relative w-full max-w-3xl">
            <ProfileImage name={name} avatar={avatar} />
          </div>
        </div>
      </div>
    </>
  )
}
