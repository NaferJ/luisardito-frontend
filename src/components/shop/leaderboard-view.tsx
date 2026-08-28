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
  Users,
  Trophy,
  Star,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
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

function formatWatchtime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "0h"
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function entryName(e: LeaderboardEntry): string {
  return e.kick_data?.username ?? e.nickname ?? "Anonymous"
}

function entryAvatar(e: LeaderboardEntry): string | undefined {
  return e.kick_data?.avatar_url ?? undefined
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

function StatPill({
  icon: Icon,
  label,
  value,
}: Readonly<{
  icon: typeof Users
  label: string
  value: string
}>) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="flex flex-col">
        <span className="text-[10px] leading-tight text-muted-foreground">{label}</span>
        <span className="text-[13px] font-semibold leading-tight text-foreground">{value}</span>
      </div>
    </div>
  )
}

function LeaderboardRow({
  entry,
  isMe,
  index,
}: Readonly<{
  entry: LeaderboardEntry
  isMe: boolean
  index: number
}>) {
  const isTop3 = entry.position <= 3
  const avatar = entryAvatar(entry)
  const name = entryName(entry)

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/30",
        index % 2 === 1 ? "bg-secondary" : "bg-card",
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
        {entry.is_vip && (
          <span className="shrink-0 rounded-full bg-gold/20 px-1.5 py-0.5 text-[10px] font-bold text-gold-bright">
            VIP
          </span>
        )}
        {entry.is_subscriber && (
          <span className="shrink-0 rounded-full bg-foreground/10 px-1.5 py-0.5 text-[10px] font-medium text-foreground">
            SUB
          </span>
        )}
      </div>

      {/* Watchtime (hidden on mobile) */}
      <span className="hidden shrink-0 text-[13px] text-muted-foreground sm:block">
        {formatWatchtime(entry.watchtime_minutes)}
      </span>

      {/* Points + change */}
      <div className="flex shrink-0 items-center gap-2.5">
        <span className="text-[14px] font-semibold tabular-nums text-gold-bright">
          {entry.puntos.toLocaleString()}
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
      {/* Stats header */}
      {stats && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-sm border border-border bg-card px-4 py-3">
          <StatPill
            icon={Users}
            label="Ranked users"
            value={stats.total_users.toLocaleString()}
          />
          <StatPill
            icon={Star}
            label="Total points"
            value={stats.total_points.toLocaleString()}
          />
          <StatPill
            icon={Trophy}
            label="Top user"
            value={stats.top_user?.nickname ?? "—"}
          />
          <StatPill
            icon={Crown}
            label="VIP users"
            value={stats.vip_users.toLocaleString()}
          />
        </div>
      )}

      {/* Reset countdown banner */}
      {meta?.days_until_reset != null && meta.days_until_reset > 0 && (
        <div className="flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/5 px-4 py-2.5">
          <Clock className="size-4 shrink-0 text-gold-bright" aria-hidden="true" />
          <span className="text-[13px] text-foreground">
            Leaderboard resets in{" "}
            <span className="font-semibold text-gold-bright">
              {meta.days_until_reset} {meta.days_until_reset === 1 ? "day" : "days"}
            </span>
          </span>
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
        <div className="overflow-hidden rounded-sm border border-border">
          {filtered.map((entry, i) => (
            <LeaderboardRow
              key={entry.usuario_id}
              entry={entry}
              isMe={entry.usuario_id === myUserId}
              index={i}
            />
          ))}

          {/* Pinned "my position" — shown when user is outside the loaded list */}
          {showPinnedMyPosition && !search && sortMode === "position" && (
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
    </div>
  )
}
