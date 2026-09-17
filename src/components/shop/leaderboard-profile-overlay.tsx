"use client"

import { useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { SubscriberBadge } from "@/components/subscriber-badge"
import { VipBadge } from "@/components/vip-badge"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { cn, formatCompactNumber, safeImageUrl } from "@/lib/utils"
import { lockBodyScroll } from "@/lib/scroll-lock"
import { useI18n } from "@/components/i18n/provider"
import { interpolate, type Dictionary } from "@/lib/i18n/shared"

type LeaderboardDict = Dictionary["leaderboard"]

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

function entryName(entry: LeaderboardEntry, t: LeaderboardDict): string {
  return entry.kick_data?.username ?? entry.display_name ?? entry.nickname ?? t.anonymous
}

function entryAvatar(entry: LeaderboardEntry): string | undefined {
  return safeImageUrl(entry.kick_data?.avatar_url)
}

function formatWatchtime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "0m"
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

function movementText(entry: LeaderboardEntry, t: LeaderboardDict): string {
  if (entry.change_indicator === "new") return t.movement.new
  if (entry.change_indicator === "neutral") return t.movement.none
  const direction = entry.change_indicator === "up" ? t.movement.up : t.movement.down
  const unit = entry.position_change === 1 ? t.movement.place : t.movement.places
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
  const { dictionary } = useI18n()
  const t = dictionary.leaderboard
  const panelRef = useRef<HTMLElement>(null)
  const indexRef = useRef(index)
  const entriesLengthRef = useRef(entries.length)
  const onCloseRef = useRef(onClose)
  const onNavigateRef = useRef(onNavigate)
  const entry = entries[index]

  useEffect(() => {
    indexRef.current = index
    entriesLengthRef.current = entries.length
    onCloseRef.current = onClose
    onNavigateRef.current = onNavigate
  }, [entries.length, index, onClose, onNavigate])

  useEffect(() => lockBodyScroll(), [])

  useEffect(() => {
    const restoreFocusTo = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => restoreFocusTo?.focus()
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const currentIndex = indexRef.current
      if (event.key === "Escape") {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault()
        onNavigateRef.current(currentIndex - 1)
        return
      }
      if (event.key === "ArrowRight" && currentIndex < entriesLengthRef.current - 1) {
        event.preventDefault()
        onNavigateRef.current(currentIndex + 1)
        return
      }
      if (event.key !== "Tab" || !panelRef.current) return
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (!panelRef.current.contains(active)) {
        event.preventDefault()
        first.focus()
      } else if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  if (!entry) return null

  const name = entryName(entry, t)
  const avatar = entryAvatar(entry)
  const canGoPrevious = index > 0
  const canGoNext = index < entries.length - 1
  const statRows = [
    { label: t.stats.position, value: `#${entry.position}` },
    { label: t.stats.points, value: formatCompactNumber(entry.puntos) },
    { label: t.stats.peakPoints, value: formatCompactNumber(entry.max_puntos ?? 0) },
    { label: t.stats.watchTime, value: formatWatchtime(entry.watchtime_minutes) },
    { label: t.stats.movement, value: movementText(entry, t) },
    { label: t.stats.previousPosition, value: entry.previous_position ? `#${entry.previous_position}` : "—" },
    { label: t.stats.previousPoints, value: entry.previous_points == null ? "—" : formatCompactNumber(entry.previous_points) },
  ]

  const identity = (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">{interpolate(t.stats.rank, { position: entry.position })}</span>
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
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="leaderboard-profile-title"
        className="overlay-enter fixed inset-y-0 left-0 right-0 z-50 flex flex-col overflow-hidden bg-background xl:left-[max(252px,calc(50vw-588px))] xl:right-auto xl:w-[292px]"
      >
        <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
          <button type="button" onClick={onClose} aria-label={t.close} className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90">
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => canGoPrevious && onNavigate(index - 1)} disabled={!canGoPrevious} aria-label={t.previousUser} className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary">
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => canGoNext && onNavigate(index + 1)} disabled={!canGoNext} aria-label={t.nextUser} className="flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary">
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
      </aside>

      <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 hidden flex-row overflow-hidden xl:flex xl:left-[max(252px,calc(50vw-588px))]">
        <div aria-hidden="true" className="pointer-events-auto absolute inset-0 bg-background/75 backdrop-blur-[8px]" />
        <div className="relative z-10 w-[292px] shrink-0" />
        <div className="relative z-10 flex min-w-0 flex-1 items-center justify-center p-8">
          <div className="overlay-media pointer-events-auto relative w-full max-w-3xl">
            <ProfileImage name={name} avatar={avatar} />
          </div>
        </div>
      </div>
    </>
  )
}
