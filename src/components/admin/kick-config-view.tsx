"use client"

import { useEffect, useState, useTransition } from "react"
import {
  Crown,
  Radio,
  Save,
  CheckCircle2,
  XCircle,
  Users,
  ArrowRightLeft,
  Coins,
  Activity,
  MessageSquare,
  Heart,
  Gift,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { KickLogo } from "@/components/brand-icons"
import {
  updateKickPointsConfig,
  updateVipConfig,
  toggleMigration,
} from "@/app/shop/admin/kick/actions"
import type {
  KickPointsConfigEntry,
  KickAdminConfig,
  BroadcasterStatus,
} from "@/lib/admin"

const FEEDBACK_TIMEOUT_MS = 4000

// ─── Points config categories ───
// The backend stores flat config_key strings; we group them into
// categories for the UI and use English labels (the seeder uses Spanish).

interface PointsCategory {
  label: string
  icon: typeof Coins
  keys: { key: string; label: string; hint: string }[]
}

const POINTS_CATEGORIES: PointsCategory[] = [
  {
    label: "Chat Messages",
    icon: MessageSquare,
    keys: [
      { key: "chat_points_regular", label: "Regular messages", hint: "Points per chat message (non-subscribers)" },
      { key: "chat_points_subscriber", label: "Subscriber messages", hint: "Points per chat message (subscribers)" },
      { key: "chat_points_vip", label: "VIP messages", hint: "Points per chat message (VIP users)" },
    ],
  },
  {
    label: "Engagement",
    icon: Heart,
    keys: [
      { key: "follow_points", label: "Follows", hint: "Points when a user follows the channel (first time only)" },
    ],
  },
  {
    label: "Subscriptions",
    icon: Zap,
    keys: [
      { key: "subscription_new_points", label: "New subscription", hint: "Points for first subscription to the channel" },
      { key: "subscription_renewal_points", label: "Renewal", hint: "Points for renewing an existing subscription" },
    ],
  },
  {
    label: "Gifts",
    icon: Gift,
    keys: [
      { key: "gift_given_points", label: "Gift subscription", hint: "Points per subscription gifted to others" },
      { key: "gift_received_points", label: "Receive gift", hint: "Points when receiving a gifted subscription" },
      { key: "kicks_gifted_multiplier", label: "Gifted kicks multiplier", hint: "Points = number of kicks x this value" },
    ],
  },
]

/** Build a lookup map from config_key → entry for quick access. */
function buildConfigMap(config: KickPointsConfigEntry[]): Record<string, KickPointsConfigEntry> {
  const map: Record<string, KickPointsConfigEntry> = {}
  for (const entry of config) map[entry.config_key] = entry
  return map
}

export function KickConfigView({
  pointsConfig,
  adminConfig,
  broadcasterStatus,
}: {
  pointsConfig: KickPointsConfigEntry[]
  adminConfig: KickAdminConfig | null
  broadcasterStatus: BroadcasterStatus | null
}) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null)

  // Auto-dismiss feedback after a delay.
  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [feedback])

  // Local state for points config editing
  const [pointsValues, setPointsValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const entry of pointsConfig) {
      map[entry.config_key] = entry.config_value
    }
    return map
  })

  // Local state for per-entry enabled toggles
  const [pointsEnabled, setPointsEnabled] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const entry of pointsConfig) {
      map[entry.config_key] = entry.enabled
    }
    return map
  })

  const configMap = buildConfigMap(pointsConfig)

  // Local state for VIP config
  const [vipConfig, setVipConfig] = useState({
    enabled: adminConfig?.vip.points_enabled ?? false,
    chat: adminConfig?.vip.chat_points ?? 0,
    follow: adminConfig?.vip.follow_points ?? 0,
    sub: adminConfig?.vip.sub_points ?? 0,
  })

  // Migration toggle
  const [migrationEnabled, setMigrationEnabled] = useState(
    adminConfig?.migration.enabled ?? false,
  )

  const handleSavePoints = (key: string) => {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateKickPointsConfig(key, pointsValues[key], pointsEnabled[key])
      setFeedback(
        result.error
          ? { ok: false, msg: result.error }
          : { ok: true, msg: `Saved ${key}` },
      )
    })
  }

  const handleToggleEnabled = (key: string) => {
    const newValue = !pointsEnabled[key]
    setPointsEnabled((prev) => ({ ...prev, [key]: newValue }))
    setFeedback(null)
    startTransition(async () => {
      const result = await updateKickPointsConfig(key, pointsValues[key], newValue)
      setFeedback(
        result.error
          ? { ok: false, msg: result.error }
          : { ok: true, msg: `${key} ${newValue ? "enabled" : "disabled"}` },
      )
    })
  }

  const handleSaveVip = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateVipConfig(
        vipConfig.enabled,
        vipConfig.chat,
        vipConfig.follow,
        vipConfig.sub,
      )
      setFeedback(
        result.error
          ? { ok: false, msg: result.error }
          : { ok: true, msg: "VIP config saved" },
      )
    })
  }

  const handleToggleMigration = () => {
    setFeedback(null)
    startTransition(async () => {
      const newValue = !migrationEnabled
      setMigrationEnabled(newValue)
      const result = await toggleMigration(newValue)
      setFeedback(
        result.error
          ? { ok: false, msg: result.error }
          : { ok: true, msg: `Migration ${newValue ? "enabled" : "disabled"}` },
      )
    })
  }

  // Stats derived from the available data.
  const stats = {
    activeVips: adminConfig?.vip.stats.active_vips ?? 0,
    expiredVips: adminConfig?.vip.stats.expired_vips ?? 0,
    migratedUsers: adminConfig?.migration.stats.migrated_users ?? 0,
    totalPointsMigrated: adminConfig?.migration.stats.total_points_migrated ?? 0,
    configEntries: pointsConfig.length,
    broadcasterOnline: broadcasterStatus?.connected ?? false,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-sm bg-foreground">
          <KickLogo className="size-5 text-background" />
        </div>
        <div className="flex min-w-0 flex-col">
          <h1 className="text-[15px] font-medium text-foreground">
            Kick Configuration
          </h1>
          <span className="text-[13px] text-muted-foreground">
            Points, VIP, and broadcaster settings
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5">
          <span
            className={cn(
              "size-2 rounded-full",
              stats.broadcasterOnline ? "bg-gold-bright" : "bg-muted-foreground",
            )}
            aria-hidden="true"
          />
          <span className="text-[12px] font-medium text-foreground">
            {stats.broadcasterOnline ? "Broadcaster online" : "Broadcaster offline"}
          </span>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          icon={<Activity className="size-3.5" />}
          label="Broadcaster"
          value={stats.broadcasterOnline ? "Online" : "Offline"}
          valueClass={stats.broadcasterOnline ? "text-gold-bright" : "text-muted-foreground"}
        />
        <StatCard
          icon={<Coins className="size-3.5" />}
          label="Config entries"
          value={String(stats.configEntries)}
        />
        <StatCard
          icon={<Crown className="size-3.5" />}
          label="Active VIPs"
          value={String(stats.activeVips)}
          valueClass="text-gold-bright"
        />
        <StatCard
          icon={<Crown className="size-3.5" />}
          label="Expired VIPs"
          value={String(stats.expiredVips)}
          valueClass="text-muted-foreground"
        />
        <StatCard
          icon={<Users className="size-3.5" />}
          label="Migrated users"
          value={stats.migratedUsers.toLocaleString()}
        />
        <StatCard
          icon={<ArrowRightLeft className="size-3.5" />}
          label="Points migrated"
          value={stats.totalPointsMigrated.toLocaleString()}
        />
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          role="status"
          className={cn(
            "flex items-center gap-2 rounded-sm border px-4 py-2.5 text-[13px]",
            feedback.ok
              ? "border-gold/30 bg-gold/10 text-foreground"
              : "border-destructive/40 bg-destructive/10 text-destructive",
          )}
        >
          {feedback.ok ? (
            <CheckCircle2 className="size-4 shrink-0 text-gold-bright" aria-hidden="true" />
          ) : (
            <XCircle className="size-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <span className="min-w-0 flex-1">{feedback.msg}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Dismiss"
          >
            <XCircle className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Broadcaster status card */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Radio className="size-4 text-gold-bright" aria-hidden="true" />
          <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
            Broadcaster status
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-11 items-center justify-center rounded-sm bg-foreground">
            <KickLogo className="size-5 text-background" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-[14px] font-medium text-foreground">
              {broadcasterStatus?.broadcaster
                ? `@${broadcasterStatus.broadcaster.kick_username}`
                : "Not connected"}
            </span>
            <span className="text-[12px] text-muted-foreground">
              {broadcasterStatus?.broadcaster
                ? `Connected ${formatTimestamp(broadcasterStatus.broadcaster.connected_at)}`
                : "No broadcaster linked to this channel"}
            </span>
          </div>
          {broadcasterStatus?.token && (
            <div
              className={cn(
                "flex flex-col items-end rounded-sm border px-3 py-1.5",
                broadcasterStatus.token.is_expired
                  ? "border-destructive/40 bg-destructive/10"
                  : "border-border bg-background",
              )}
            >
              <span className="text-[11px] text-muted-foreground">Token</span>
              <span
                className={cn(
                  "text-[12px] font-medium",
                  broadcasterStatus.token.is_expired
                    ? "text-destructive"
                    : "text-foreground",
                )}
              >
                {broadcasterStatus.token.is_expired ? "Expired" : "Valid"}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Radio
              className={cn(
                "size-4",
                broadcasterStatus?.connected ? "text-gold-bright" : "text-muted-foreground",
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "text-[13px] font-medium",
                broadcasterStatus?.connected ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {broadcasterStatus?.connected ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Points configuration — grouped by category */}
      {pointsConfig.length > 0 && (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <Coins className="size-4 text-gold-bright" aria-hidden="true" />
            <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
              Points configuration
            </span>
          </div>

          {POINTS_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon
            // Only render categories that have at least one matching config entry
            const visibleKeys = category.keys.filter((k) => configMap[k.key])
            if (visibleKeys.length === 0) return null

            return (
              <div key={category.label} className="flex flex-col gap-2">
                {/* Category header */}
                <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
                  <CategoryIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">
                    {category.label}
                  </span>
                </div>

                {/* Config rows */}
                <div className="flex flex-col gap-1">
                  {visibleKeys.map((cfg) => {
                    const entry = configMap[cfg.key]
                    const isEnabled = pointsEnabled[cfg.key] ?? entry.enabled
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "flex items-center gap-3 rounded-sm px-3 py-2.5 transition-colors hover:bg-background/30",
                          !isEnabled && "opacity-60",
                        )}
                      >
                        {/* Label + hint */}
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-[13px] font-medium text-foreground">
                            {cfg.label}
                          </span>
                          <span className="truncate text-[11px] text-muted-foreground">
                            {cfg.hint}
                          </span>
                        </div>

                        {/* Enabled toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(cfg.key)}
                          disabled={pending}
                          className="flex shrink-0 items-center gap-1.5"
                          aria-label={`Toggle ${cfg.label}`}
                          aria-pressed={isEnabled}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                              isEnabled ? "bg-gold" : "bg-border",
                            )}
                          >
                            <span
                              className={cn(
                                "size-4 rounded-full bg-background transition-transform",
                                isEnabled && "translate-x-4",
                              )}
                            />
                          </span>
                          <span className="w-12 shrink-0 text-[11px] font-medium text-muted-foreground">
                            {isEnabled ? "Active" : "Off"}
                          </span>
                        </button>

                        {/* Value input */}
                        <input
                          type="number"
                          value={pointsValues[cfg.key] ?? 0}
                          onChange={(e) =>
                            setPointsValues((prev) => ({
                              ...prev,
                              [cfg.key]: Number(e.target.value),
                            }))
                          }
                          disabled={!isEnabled}
                          className="h-8 w-20 shrink-0 rounded-sm border border-border bg-background px-3 text-right text-[14px] tabular-nums text-foreground focus:border-gold focus:outline-none disabled:opacity-50"
                        />

                        {/* Save button */}
                        <button
                          type="button"
                          onClick={() => handleSavePoints(cfg.key)}
                          disabled={pending}
                          className="flex h-8 w-16 shrink-0 items-center justify-center gap-1 rounded-full bg-foreground px-2 text-[11px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                        >
                          <Save className="size-3" aria-hidden="true" />
                          Save
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* VIP configuration */}
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-gold-bright" aria-hidden="true" />
          <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
            VIP configuration
          </span>
        </div>

        {/* VIP toggle */}
        <button
          type="button"
          onClick={() => setVipConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2.5 transition-colors hover:border-gold/40"
        >
          <span className="text-[13px] font-medium text-foreground">
            VIP points enabled
          </span>
          <span
            className={cn(
              "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
              vipConfig.enabled ? "bg-gold" : "bg-border",
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full bg-background transition-transform",
                vipConfig.enabled && "translate-x-4",
              )}
            />
          </span>
        </button>

        {/* VIP points fields */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <VipField
            label="Chat points"
            value={vipConfig.chat}
            onChange={(v) => setVipConfig((prev) => ({ ...prev, chat: v }))}
          />
          <VipField
            label="Follow points"
            value={vipConfig.follow}
            onChange={(v) => setVipConfig((prev) => ({ ...prev, follow: v }))}
          />
          <VipField
            label="Sub points"
            value={vipConfig.sub}
            onChange={(v) => setVipConfig((prev) => ({ ...prev, sub: v }))}
          />
        </div>

        {/* VIP stats */}
        {adminConfig && (
          <div className="flex flex-wrap gap-4 rounded-sm border border-border bg-background px-3 py-2.5 text-[12px] text-muted-foreground">
            <span>
              Active VIPs:{" "}
              <span className="font-medium text-gold-bright">
                {adminConfig.vip.stats.active_vips}
              </span>
            </span>
            <span>
              Expired:{" "}
              <span className="font-medium text-foreground">
                {adminConfig.vip.stats.expired_vips}
              </span>
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveVip}
          disabled={pending}
          className="flex h-9 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          <Save className="size-3.5" aria-hidden="true" />
          {pending ? "Saving..." : "Save VIP config"}
        </button>
      </div>

      {/* Migration */}
      {adminConfig && (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-4 text-gold-bright" aria-hidden="true" />
            <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
              Botrix migration
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-[13px] font-medium text-foreground">
                Migration status
              </span>
              <span className="text-[12px] text-muted-foreground">
                {adminConfig.migration.stats.migrated_users.toLocaleString()} users
                migrated
                {" - "}
                {adminConfig.migration.stats.total_points_migrated.toLocaleString()}{" "}
                points transferred
              </span>
            </div>
            <button
              type="button"
              onClick={handleToggleMigration}
              disabled={pending}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                  migrationEnabled ? "bg-gold" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "size-4 rounded-full bg-background transition-transform",
                    migrationEnabled && "translate-x-4",
                  )}
                />
              </span>
              <span className="text-[13px] font-medium text-foreground">
                {migrationEnabled ? "Enabled" : "Disabled"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-secondary p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span
        className={cn(
          "text-[18px] font-bold tabular-nums",
          valueClass ?? "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  )
}

function VipField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-9 w-full rounded-sm border border-border bg-background px-3 text-[14px] text-foreground focus:border-gold focus:outline-none"
      />
    </label>
  )
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
