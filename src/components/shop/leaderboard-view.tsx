"use client"

import { useMemo, useState, useCallback } from "react"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Search,
  X,
  Crown,
  Clock,
  Loader2,
} from "lucide-react"
import { cn, formatCompactNumber } from "@/lib/utils"
import { VipBadge } from "@/components/vip-badge"
import { SubscriberBadge } from "@/components/subscriber-badge"
import { LeaderboardProfileOverlay } from "@/components/shop/leaderboard-profile-overlay"
import type {
  LeaderboardEntry,
  LeaderboardMeta,
  LeaderboardStats,
} from "@/lib/leaderboard"
import { publicApiFetch } from "@/lib/public-api"

type SortMode = "position" | "points-desc" | "watchtime-desc"

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "position", label: "Position" },
  { mode: "points-desc", label: "Most points" },
  { mode: "watchtime-desc", label: "Most watchtime" },
]

const PAGE_SIZE = 25

function entryName(entry: LeaderboardEntry): string {
  return entry.kick_data?.username ?? entry.display_name ?? entry.nickname ?? "Anonymous"
}

function entryAvatar(entry: LeaderboardEntry): string | undefined {
  return entry.kick_data?.avatar_url ?? undefined
}

function formatLastUpdated(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value))
}

function resetCountdown(meta: LeaderboardMeta): string | null {
  if (meta.hours_until_reset != null && meta.hours_until_reset < 24) {
    return `${meta.hours_until_reset} ${meta.hours_until_reset === 1 ? "hour" : "hours"}`
  }
  if (meta.days_until_reset != null && meta.days_until_reset > 0) {
    return `${meta.days_until_reset} ${meta.days_until_reset === 1 ? "day" : "days"}`
  }
  return null
}

function ChangeIndicator({ entry }: Readonly<{ entry: LeaderboardEntry }>) {
  switch (entry.change_indicator) {
    case "up":
      return (
        <span className="flex items-center gap-0.5 text-foreground">
          <ArrowUp className="size-3" aria-hidden="true" />
          <span className="text-[12px] font-semibold">{entry.position_change}</span>
        </span>
      )
    case "down":
      return (
        <span className="flex items-center gap-0.5 text-destructive">
          <ArrowDown className="size-3" aria-hidden="true" />
          <span className="text-[12px] font-semibold">{entry.position_change}</span>
        </span>
      )
    case "new":
      return (
        <span className="flex items-center gap-0.5 text-gold-bright">
          <Sparkles className="size-3" aria-hidden="true" />
          <span className="text-[11px] font-semibold">NEW</span>
        </span>
      )
    default:
      return <Minus className="size-3 text-muted-foreground" aria-hidden="true" />
  }
}

function formatWatchtime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "0h"
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function RowMetric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <span className="flex w-[4.5rem] min-w-0 flex-col gap-0.5 text-right">
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="truncate text-[12px] tabular-nums text-foreground">{value}</span>
    </span>
  )
}

function LeaderboardRow({
  entry,
  isMe,
  index,
  onOpen,
}: Readonly<{
  entry: LeaderboardEntry
  isMe: boolean
  index: number
  onOpen: () => void
}>) {
  const isTop3 = entry.position <= 3
  const avatar = entryAvatar(entry)
  const name = entryName(entry)

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${name}'s leaderboard profile`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          onOpen()
        }
      }}
      className={cn(
        "flex cursor-pointer items-center gap-3 border-b border-border/20 px-4 py-3.5 transition-colors last:border-b-0 hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold",
        index % 2 === 1 ? "bg-card/90" : "bg-background/70",
        isMe && "ring-1 ring-inset ring-gold/40",
      )}
    >
      {/* Position */}
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md text-[13px] font-bold tabular-nums",
          isTop3
            ? "bg-gold/20 text-gold-bright"
            : "bg-muted text-muted-foreground",
        )}
      >
        {entry.position}
      </span>

      {/* Avatar */}
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt={name}
          className="size-9 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-[13px] font-semibold text-foreground"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}

      {/* Name + badges */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-[14px] font-medium text-foreground">{name}</span>
        {isMe && (
          <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
            YOU
          </span>
        )}
        {entry.is_subscriber && (
          <SubscriberBadge
            durationMonths={entry.subscription_duration_months}
            size={25}
            className="shrink-0"
          />
        )}
        {Boolean(entry.is_vip) && (
          <VipBadge size={25} className="shrink-0" />
        )}
      </div>

      <div className="hidden w-[11rem] shrink-0 grid-cols-2 gap-3 lg:grid">
        <RowMetric label="Watch" value={formatWatchtime(entry.watchtime_minutes)} />
        <RowMetric label="Peak" value={formatCompactNumber(entry.max_puntos ?? 0)} />
      </div>

      {/* Points + change */}
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="w-16 text-right text-[14px] font-semibold tabular-nums text-gold-bright">
          {formatCompactNumber(entry.puntos)}
        </span>
        <div className="w-10 text-right">
          <ChangeIndicator entry={entry} />
        </div>
      </div>
    </div>
  )
}

export function LeaderboardView({
  initialEntries,
  meta,
  stats,
  myPosition,
  myUserId,
}: Readonly<{
  initialEntries: LeaderboardEntry[]
  meta: LeaderboardMeta | null
  stats: LeaderboardStats | null
  myPosition: LeaderboardEntry | null
  myUserId?: number
}>) {
  const [search, setSearch] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("position")
  const [extraEntries, setExtraEntries] = useState<LeaderboardEntry[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [openUserId, setOpenUserId] = useState<number | null>(null)
  const [hasMore, setHasMore] = useState(initialEntries.length < (meta?.total ?? initialEntries.length))

  const allEntries = useMemo(
    () => [...initialEntries, ...extraEntries],
    [initialEntries, extraEntries],
  )

  const filtered = useMemo(() => {
    let result = [...allEntries]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter((e) => entryName(e).toLowerCase().includes(term))
    }
    if (sortMode === "points-desc") {
      result.sort((a, b) => b.puntos - a.puntos)
    } else if (sortMode === "watchtime-desc") {
      result.sort((a, b) => (b.watchtime_minutes ?? 0) - (a.watchtime_minutes ?? 0))
    }
    return result
  }, [allEntries, search, sortMode])

  const myEntryInList = useMemo(
    () => allEntries.find((e) => e.usuario_id === myUserId) ?? null,
    [allEntries, myUserId],
  )

  const showPinnedMyPosition = myPosition && !myEntryInList
  const displaysPinnedPosition = Boolean(showPinnedMyPosition && !search && sortMode === "position")
  const detailEntries = useMemo(
    () => displaysPinnedPosition && myPosition ? [...filtered, myPosition] : filtered,
    [displaysPinnedPosition, filtered, myPosition],
  )
  const openIndex = openUserId == null
    ? -1
    : detailEntries.findIndex((entry) => entry.usuario_id === openUserId)
  const countdown = meta ? resetCountdown(meta) : null

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const offset = allEntries.length
      const response = await publicApiFetch<{ data: LeaderboardEntry[] }>(
        `/api/leaderboard?limit=${PAGE_SIZE}&offset=${offset}`,
      )
      const entries = response.data ?? []
      if (entries.length > 0) {
        setExtraEntries((prev) => [...prev, ...entries])
        setHasMore(allEntries.length + entries.length < (meta?.total ?? 0))
      } else {
        setHasMore(false)
      }
    } catch {
      setHasMore(false)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, allEntries.length, meta])

  if (initialEntries.length === 0 && extraEntries.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-border p-8">
        <Crown className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-medium text-foreground">No rankings yet</p>
        <p className="text-[13px] text-muted-foreground">
          Start watching streams to earn points and climb the leaderboard.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {stats && (
        <div className="flex items-baseline gap-2 border-b border-border/40 pb-3">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Total points in play</span>
          <strong className="text-[15px] font-semibold tabular-nums text-gold-bright">{formatCompactNumber(stats.total_points)}</strong>
        </div>
      )}

      {/* Reset countdown banner */}
      {(countdown || meta?.last_update) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-sm border border-gold/30 bg-gold/5 px-4 py-2.5">
          {countdown && (
            <span className="flex items-center gap-2 text-[13px] text-foreground">
              <Clock className="size-4 shrink-0 text-gold-bright" aria-hidden="true" />
              Leaderboard resets in <strong className="font-semibold text-gold-bright">{countdown}</strong>
            </span>
          )}
          {meta?.last_update && (
            <span className="text-[11px] text-muted-foreground sm:ml-auto">
              Updated {formatLastUpdated(meta.last_update)}
            </span>
          )}
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex h-9 items-center sm:max-w-[240px]">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            aria-label="Search users"
            className="h-9 w-full rounded-full border border-border bg-card pl-9 pr-7 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.mode}
              type="button"
              onClick={() => setSortMode(opt.mode)}
              aria-pressed={sortMode === opt.mode}
              className={cn(
                "h-8 rounded-full px-3 text-[12px] font-medium transition-colors",
                sortMode === opt.mode
                  ? "bg-gold text-gold-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="shrink-0 text-[12px] text-muted-foreground sm:ml-auto">
          {filtered.length}/{meta?.total ?? allEntries.length}
        </span>
      </div>

      {/* List — /jobs template pattern */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-sm border border-dashed border-border p-6">
          <p className="text-[13px] text-muted-foreground">No users match your search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-border/60 bg-background/50 shadow-sm">
          {filtered.map((entry, i) => (
            <LeaderboardRow
              key={entry.usuario_id}
              entry={entry}
              isMe={entry.usuario_id === myUserId}
              index={i}
              onOpen={() => setOpenUserId(entry.usuario_id)}
            />
          ))}

          {/* Pinned "my position" — shown when user is outside the loaded list */}
          {displaysPinnedPosition && myPosition && (
            <>
              <div className="flex items-center justify-center gap-1 bg-card py-1.5 text-muted-foreground">
                <span className="text-[16px] leading-none">.</span>
                <span className="text-[16px] leading-none">.</span>
                <span className="text-[16px] leading-none">.</span>
              </div>
              <LeaderboardRow
                entry={myPosition}
                isMe
                index={1}
                onOpen={() => setOpenUserId(myPosition.usuario_id)}
              />
            </>
          )}
        </div>
      )}

      {/* Load more */}
      {hasMore && !search && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="flex h-9 items-center gap-2 rounded-full border border-border bg-card px-5 text-[13px] font-medium text-foreground transition-colors hover:border-gold hover:text-gold-bright disabled:opacity-50"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </button>
        </div>
      )}

      {openIndex >= 0 && (
        <LeaderboardProfileOverlay
          entries={detailEntries}
          index={openIndex}
          onClose={() => setOpenUserId(null)}
          onNavigate={(nextIndex) => setOpenUserId(detailEntries[nextIndex].usuario_id)}
        />
      )}
    </div>
  )
}
