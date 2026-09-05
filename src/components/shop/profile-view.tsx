"use client"

import { useState } from "react"
import {
  LogOut,
  RefreshCw,
  Crown,
  Star,
  ExternalLink,
} from "lucide-react"
import { cn, formatCompactNumber } from "@/lib/utils"
import { KickLogo, DiscordLogo } from "@/components/brand-icons"
import { VipBadge } from "@/components/vip-badge"
import { SubscriberBadge } from "@/components/subscriber-badge"
import type { Usuario } from "@/types"

function displayName(user: Usuario): string {
  return user.kick_data?.username ?? user.nickname ?? user.nombre ?? user.email
}

function avatarUrl(user: Usuario): string | undefined {
  return user.kick_data?.avatar_url ?? user.kick_avatar ?? user.avatar_url ?? undefined
}

function formatVipExpiry(expiresAt?: string): string {
  if (!expiresAt) return "Permanent"
  const date = new Date(expiresAt)
  const now = new Date()
  const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return "Expired"
  if (days === 1) return "Expires tomorrow"
  return `Expires in ${days} days`
}

export function ProfileView({
  user,
  onLogout,
}: Readonly<{
  user: Usuario
  onLogout: () => Promise<void>
}>) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const name = displayName(user)
  const avatar = avatarUrl(user)
  const isAdmin = [3, 4, 5].includes(user.rol_id)
  const isVip = Boolean(user.vip_status?.is_active ?? user.vip_info?.is_active ?? user.is_vip ?? false)
  const isSubscriber = user.subscriber_status?.is_active ?? false
  const subDuration = user.subscriber_status?.subscription_duration_months
  const discordLinked = user.discord_info?.linked ?? user.discordLinked ?? false

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await onLogout()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Identity card — avatar, name, badges, stats, logout all in one row */}
      <div className="flex flex-wrap items-center gap-4 rounded-sm border border-border bg-secondary p-4">
        {/* Avatar */}
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt={name}
            className="size-14 shrink-0 rounded-full object-cover ring-2 ring-border"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-muted text-[22px] font-bold text-foreground ring-2 ring-border"
          >
            {name.charAt(0).toUpperCase()}
          </span>
        )}

        {/* Name + badges */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-[18px] font-semibold text-foreground">{name}</span>
            {isVip && (
              <span className="flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[11px] font-bold text-gold-bright">
                <Crown className="size-3" aria-hidden="true" />
                VIP
              </span>
            )}
            {isSubscriber && (
              subDuration != null ? (
                <SubscriberBadge durationMonths={subDuration} size={18} />
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-0.5 text-[11px] font-bold text-foreground">
                  <Star className="size-3" aria-hidden="true" />
                  SUB
                </span>
              )
            )}
            {isAdmin && (
              <span className="rounded-full bg-gold px-2 py-0.5 text-[11px] font-bold text-gold-foreground">
                ADMIN
              </span>
            )}
          </div>
          {user.email && (
            <span className="truncate text-[13px] text-muted-foreground">{user.email}</span>
          )}
        </div>

        {/* Stats — inline to the right of the name */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[11px] text-muted-foreground">Points</span>
            <span className="text-[16px] font-semibold text-gold-bright">
              {formatCompactNumber(user.puntos)}
            </span>
          </div>
          {user.creado && (
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-muted-foreground">Member since</span>
              <span className="text-[16px] font-semibold text-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  month: "short",
                  year: "numeric",
                }).format(new Date(user.creado))}
              </span>
            </div>
          )}
          {isVip && user.vip_info?.is_active && (
            <div className="flex flex-col items-end">
              <VipBadge size={16} />
              <span className="text-[14px] font-semibold text-gold-bright">
                {formatVipExpiry(user.vip_info.expires_at)}
              </span>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[13px] font-medium text-foreground transition-colors hover:border-destructive hover:text-destructive disabled:opacity-50"
        >
          {isLoggingOut ? (
            <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <LogOut className="size-3.5" aria-hidden="true" />
          )}
          {isLoggingOut ? "..." : "Logout"}
        </button>
      </div>

      {/* Connected accounts */}
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
        <span className="text-[13px] font-medium text-foreground">Connected accounts</span>

        {/* Kick */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-sm bg-foreground">
              <KickLogo className="size-4 text-background" />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-foreground">Kick</span>
              {user.kick_data?.username ? (
                <span className="text-[12px] text-muted-foreground">@{user.kick_data.username}</span>
              ) : (
                <span className="text-[12px] text-muted-foreground">Connected</span>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
            <span className="size-2 rounded-full bg-foreground" aria-hidden="true" />
            {"Connected"}
          </span>
        </div>

        {/* Discord */}
        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-3">
          <div className="flex items-center gap-2.5">
            <div className={cn(
              "flex size-8 items-center justify-center rounded-sm",
              discordLinked ? "bg-foreground" : "bg-muted",
            )}>
              <DiscordLogo className={cn("size-4", discordLinked ? "text-background" : "text-muted-foreground")} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-medium text-foreground">Discord</span>
              {discordLinked && user.discord_info?.username ? (
                <span className="text-[12px] text-muted-foreground">@{user.discord_info.username}</span>
              ) : (
                <span className="text-[12px] text-muted-foreground">Not connected</span>
              )}
            </div>
          </div>
          {discordLinked ? (
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-foreground">
              <span className="size-2 rounded-full bg-foreground" aria-hidden="true" />
              {"Connected"}
            </span>
          ) : (
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/auth/discord`}
              className="flex items-center gap-1 text-[12px] font-medium text-gold-bright hover:text-gold-core"
            >
              Link
              <ExternalLink className="size-3" aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
