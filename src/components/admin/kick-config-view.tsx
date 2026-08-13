"use client"

import { useState, useTransition } from "react"
import { Crown, Radio, Save } from "lucide-react"
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

  // Local state for points config editing
  const [pointsValues, setPointsValues] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {}
    for (const entry of pointsConfig) {
      map[entry.config_key] = entry.config_value
    }
    return map
  })

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
      const result = await updateKickPointsConfig(key, pointsValues[key])
      setFeedback(result.error ? { ok: false, msg: result.error } : { ok: true, msg: `Saved ${key}` })
    })
  }

  const handleSaveVip = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await updateVipConfig(vipConfig.enabled, vipConfig.chat, vipConfig.follow, vipConfig.sub)
      setFeedback(result.error ? { ok: false, msg: result.error } : { ok: true, msg: "VIP config saved" })
    })
  }

  const handleToggleMigration = () => {
    setFeedback(null)
    startTransition(async () => {
      const newValue = !migrationEnabled
      setMigrationEnabled(newValue)
      const result = await toggleMigration(newValue)
      setFeedback(result.error ? { ok: false, msg: result.error } : { ok: true, msg: `Migration ${newValue ? "enabled" : "disabled"}` })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Kick Configuration</h1>
        <span className="text-[13px] text-muted-foreground">Points, VIP, and broadcaster settings</span>
      </div>

      {feedback && (
        <div className={cn(
          "rounded-sm border px-4 py-2.5 text-[13px]",
          feedback.ok ? "border-foreground/20 bg-foreground/5 text-foreground" : "border-destructive/40 bg-destructive/10 text-destructive",
        )}>
          {feedback.msg}
        </div>
      )}

      {/* Broadcaster status */}
      <div className="flex items-center gap-3 rounded-sm border border-border bg-secondary p-4">
        <div className="flex size-10 items-center justify-center rounded-sm bg-foreground">
          <KickLogo className="size-5 text-background" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[14px] font-medium text-foreground">Broadcaster</span>
          {broadcasterStatus?.broadcaster ? (
            <span className="text-[12px] text-muted-foreground">
              @{broadcasterStatus.broadcaster.kick_username}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground">Not connected</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Radio className={cn("size-4", broadcasterStatus?.connected ? "text-foreground" : "text-muted-foreground")} />
          <span className={cn("text-[13px] font-medium", broadcasterStatus?.connected ? "text-foreground" : "text-muted-foreground")}>
            {broadcasterStatus?.connected ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Points configuration */}
      {pointsConfig.length > 0 && (
        <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
          <span className="text-[13px] font-medium text-foreground">Points configuration</span>
          <div className="flex flex-col gap-2">
            {pointsConfig.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px] font-medium text-foreground">
                    {entry.description ?? entry.config_key}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">{entry.config_key}</span>
                </div>
                <input
                  type="number"
                  value={pointsValues[entry.config_key] ?? 0}
                  onChange={(e) =>
                    setPointsValues((prev) => ({ ...prev, [entry.config_key]: Number(e.target.value) }))
                  }
                  className="h-8 w-24 rounded-sm border border-border bg-background px-3 text-right text-[14px] tabular-nums text-foreground focus:border-gold focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSavePoints(entry.config_key)}
                  disabled={pending}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-3 text-[12px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                >
                  <Save className="size-3" />
                  Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIP configuration */}
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-4">
        <div className="flex items-center gap-2">
          <Crown className="size-4 text-gold-bright" />
          <span className="text-[13px] font-medium text-foreground">VIP configuration</span>
        </div>

        {/* VIP toggle */}
        <button
          type="button"
          onClick={() => setVipConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className="flex items-center gap-2"
        >
          <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", vipConfig.enabled ? "bg-gold" : "bg-border")}>
            <span className={cn("size-4 rounded-full bg-background transition-transform", vipConfig.enabled && "translate-x-4")} />
          </span>
          <span className="text-[13px] text-foreground">VIP points enabled</span>
        </button>

        {/* VIP points */}
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
          <div className="flex gap-4 text-[12px] text-muted-foreground">
            <span>Active VIPs: <span className="font-medium text-foreground">{adminConfig.vip.stats.active_vips}</span></span>
            <span>Expired: <span className="font-medium text-foreground">{adminConfig.vip.stats.expired_vips}</span></span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSaveVip}
          disabled={pending}
          className="flex h-9 items-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          <Save className="size-3.5" />
          {pending ? "Saving..." : "Save VIP config"}
        </button>
      </div>

      {/* Migration */}
      {adminConfig && (
        <div className="flex items-center justify-between gap-3 rounded-sm border border-border bg-secondary p-4">
          <div className="flex flex-col">
            <span className="text-[13px] font-medium text-foreground">Botrix migration</span>
            <span className="text-[12px] text-muted-foreground">
              {adminConfig.migration.stats.migrated_users} users migrated •{" "}
              {adminConfig.migration.stats.total_points_migrated.toLocaleString()} points transferred
            </span>
          </div>
          <button
            type="button"
            onClick={handleToggleMigration}
            disabled={pending}
            className="flex items-center gap-2"
          >
            <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", migrationEnabled ? "bg-gold" : "bg-border")}>
              <span className={cn("size-4 rounded-full bg-background transition-transform", migrationEnabled && "translate-x-4")} />
            </span>
            <span className="text-[13px] text-foreground">{migrationEnabled ? "Enabled" : "Disabled"}</span>
          </button>
        </div>
      )}
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
