"use client"

import { useMemo, useState } from "react"
import {
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Search,
  X,
  Crown,
  Medal,
  Award,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/leaderboard"

type SortMode = "position" | "points-desc" | "watchtime-desc"

const SORT_OPTIONS: { mode: SortMode; label: string }[] = [
  { mode: "position", label: "Position" },
  { mode: "points-desc", label: "Most points" },
  { mode: "watchtime-desc", label: "Most watchtime" },
]

function formatWatchtime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "0h"
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
}

function entryName(e: LeaderboardEntry): string {
  return e.kick_data?.username ?? e.nickname ?? `User ${e.usuario_id}`
}

function entryAvatar(e: LeaderboardEntry): string | undefined {
  return e.kick_data?.avatar_url ?? undefined
}

const POSITION_ICONS = [Crown, Medal, Award]

function ChangeIndicator({ entry }: { entry: LeaderboardEntry }) {
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

export function LeaderboardView({
  entries,
  myPosition,
  myUserId,
}: {
  entries: LeaderboardEntry[]
  myPosition: LeaderboardEntry | null
  myUserId?: number
}) {
  const [search, setSearch] = useState("")
  const [sortMode, setSortMode] = useState<SortMode>("position")

  const filtered = useMemo(() => {
    let result = [...entries]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter((e) => entryName(e).toLowerCase().includes(term))
    }
    if (sortMode === "points-desc") {
      result.sort((a, b) => b.puntos - a.puntos)
    } else if (sortMode === "watchtime-desc") {
      result.sort((a, b) => (b.watchtime_minutes ?? 0) - (a.watchtime_minutes ?? 0))
    }
    // "position" keeps the original API order
    return result
  }, [entries, search, sortMode])

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8">
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
      {/* My position card */}
      {myPosition && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-muted-foreground">Your position</span>
            <div className="flex items-center gap-2">
              <span className="text-[24px] font-bold leading-none text-foreground">
                #{myPosition.position}
              </span>
              <ChangeIndicator entry={myPosition} />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {myPosition.watchtime_minutes !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-[11px] text-muted-foreground">Watchtime</span>
                <span className="text-[15px] font-semibold text-foreground">
                  {formatWatchtime(myPosition.watchtime_minutes)}
                </span>
              </div>
            )}
            {myPosition.max_puntos !== undefined && (
              <div className="flex flex-col items-end">
                <span className="text-[11px] text-muted-foreground">Max pts</span>
                <span className="text-[15px] font-semibold text-foreground">
                  {myPosition.max_puntos.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-muted-foreground">Points</span>
              <span className="text-[15px] font-semibold text-gold-bright">
                {myPosition.puntos.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-3 sm:flex-row sm:items-center">
        <div className="relative flex h-8 items-center sm:max-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            aria-label="Search users"
            className="h-8 w-full rounded-full border border-border bg-background pl-8 pr-7 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-2 flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" aria-hidden="true" />
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
                "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
                sortMode === opt.mode
                  ? "bg-gold text-gold-foreground"
                  : "bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <span className="shrink-0 text-[12px] text-muted-foreground sm:ml-auto">
          {filtered.length}/{entries.length}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-sm border border-dashed border-border p-6">
          <p className="text-[13px] text-muted-foreground">No users match your search.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-sm border border-border">
          {/* Header row */}
          <div className="grid grid-cols-[60px_1fr_auto_auto_auto] gap-3 border-b border-border bg-secondary px-4 py-2 text-[11px] font-medium text-muted-foreground">
            <span>Pos</span>
            <span>User</span>
            <span className="hidden text-right sm:block">Watchtime</span>
            <span className="hidden text-right sm:block">Max pts</span>
            <span className="text-right">Points</span>
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {filtered.map((entry) => {
              const isMe = entry.usuario_id === myUserId
              const isTop3 = entry.position <= 3
              const PositionIcon = isTop3 ? POSITION_ICONS[entry.position - 1] : null
              const avatar = entryAvatar(entry)
              return (
                <div
                  key={entry.usuario_id}
                  className={cn(
                    "grid grid-cols-[60px_1fr_auto_auto_auto] items-center gap-3 border-b border-border/50 px-4 py-2.5 transition-colors last:border-b-0 hover:bg-secondary",
                    isMe && "bg-gold/10",
                    isTop3 && sortMode === "position" && "bg-gold/5",
                  )}
                >
                  {/* Position */}
                  <div className="flex items-center gap-1">
                    {PositionIcon ? (
                      <PositionIcon
                        className={cn(
                          "size-4",
                          entry.position === 1
                            ? "text-gold-bright"
                            : entry.position === 2
                              ? "text-muted-foreground"
                              : "text-gold-deep",
                        )}
                        aria-hidden="true"
                      />
                    ) : null}
                    <span
                      className={cn(
                        "text-[14px] font-semibold",
                        isTop3 ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      #{entry.position}
                    </span>
                  </div>

                  {/* User */}
                  <div className="flex min-w-0 items-center gap-2">
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatar}
                        alt={entryName(entry)}
                        className="size-7 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[12px] font-semibold text-foreground"
                      >
                        {entryName(entry).charAt(0).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate text-[13px] font-medium text-foreground">
                      {entryName(entry)}
                    </span>
                    {isMe && (
                      <span className="shrink-0 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                        YOU
                      </span>
                    )}
                    {entry.is_vip && (
                      <span className="shrink-0 text-[10px] font-bold text-gold-core">VIP</span>
                    )}
                    {entry.is_subscriber && (
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                        SUB
                      </span>
                    )}
                  </div>

                  {/* Watchtime */}
                  <span className="hidden text-right text-[13px] text-muted-foreground sm:block">
                    {formatWatchtime(entry.watchtime_minutes)}
                  </span>

                  {/* Max points */}
                  <span className="hidden text-right text-[13px] text-muted-foreground sm:block">
                    {(entry.max_puntos ?? 0).toLocaleString()}
                  </span>

                  {/* Points + change */}
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-[14px] font-semibold text-foreground">
                      {entry.puntos.toLocaleString()}
                    </span>
                    <div className="w-12 text-right">
                      <ChangeIndicator entry={entry} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
