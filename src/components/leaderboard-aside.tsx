import Link from "next/link"
import { cn, formatCompactNumber } from "@/lib/utils"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { VipBadge } from "@/components/vip-badge"
import { SubscriberBadge } from "@/components/subscriber-badge"

function entryName(entry: LeaderboardEntry): string {
  return entry.kick_data?.username ?? entry.nickname ?? "Anonymous"
}

function entryAvatar(entry: LeaderboardEntry): string | undefined {
  return entry.kick_data?.avatar_url ?? undefined
}

const AVATAR_COLORS = [
  "bg-gold-highlight",
  "bg-gold-bright",
  "bg-gold-deep",
  "bg-gray-medium",
  "bg-gold-core",
]

export function LeaderboardAside({ entries }: Readonly<{ entries: LeaderboardEntry[] }>) {
  if (entries.length === 0) return null

  return (
    <div className="mb-3 flex flex-col gap-3 rounded-sm bg-secondary px-4 py-3 break-inside-avoid">
      <span className="text-[13px] font-medium text-muted-foreground">
        Top earners
      </span>
      <div className="flex flex-col">
        {entries.map((entry, i) => {
          const name = entryName(entry)
          const avatar = entryAvatar(entry)
          return (
            <Link
              key={entry.usuario_id}
              href="/shop/leaderboard"
              className="-mx-4 flex items-center gap-3 px-4 py-1.5 transition-colors hover:bg-accent/30"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={name}
                  className="size-9 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-background",
                    AVATAR_COLORS[i % AVATAR_COLORS.length],
                  )}
                >
                  {name.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-medium text-foreground">
                  {name}
                </span>
                <span className="text-[13px] text-gold-bright">
                  {formatCompactNumber(entry.puntos)}
                </span>
              </div>
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
            </Link>
          )
        })}
      </div>
      <Link
        href="/shop/leaderboard"
        className="text-[13px] font-medium text-foreground underline underline-offset-4"
      >
        See full leaderboard
      </Link>
    </div>
  )
}
