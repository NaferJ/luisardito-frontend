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
import { cn, formatCompactNumber } from "@/lib/utils"
import { KickLogo } from "@/components/brand-icons"
import { useI18n } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"
import type { Dictionary } from "@/lib/i18n/shared"
import {
  updateKickPointsConfig,
  updateVipConfig,
  toggleMigration,
} from "@/app/[lang]/shop/admin/kick/actions"
import type {
  KickPointsConfigEntry,
  KickAdminConfig,
  BroadcasterStatus,
} from "@/lib/admin"

const FEEDBACK_TIMEOUT_MS = 4000

// ─── Points config categories ───
// The backend stores flat config_key strings; we group them into
// categories for the UI and use English labels (the seeder uses Spanish).

type KickDict = Dictionary["admin"]["kick"]
type KickKey = keyof KickDict["keys"]

interface PointsCategory {
  readonly label: (t: KickDict) => string
  readonly icon: typeof Coins
  readonly keys: KickKey[]
}

const POINTS_CATEGORIES: PointsCategory[] = [
  {
    label: (t) => t.categories.chat,
    icon: MessageSquare,
    keys: ["chat_points_regular", "chat_points_subscriber", "chat_points_vip"],
  },
  {
    label: (t) => t.categories.engagement,
    icon: Heart,
    keys: ["follow_points"],
  },
  {
    label: (t) => t.categories.subscriptions,
    icon: Zap,
    keys: ["subscription_new_points", "subscription_renewal_points"],
  },
  {
    label: (t) => t.categories.gifts,
    icon: Gift,
    keys: ["gift_given_points", "gift_received_points", "kicks_gifted_multiplier"],
  },
]

interface VipConfigState {
  enabled: boolean
  chat: number
  follow: number
  sub: number
}

interface FeedbackState {
  ok: boolean
  msg: string
}

interface Stats {
  activeVips: number
  expiredVips: number
  migratedUsers: number
  totalPointsMigrated: number
  configEntries: number
  broadcasterOnline: boolean
}

/** Build a lookup map from config_key → entry for quick access. */
function buildConfigMap(config: KickPointsConfigEntry[]): Record<string, KickPointsConfigEntry> {
  const map: Record<string, KickPointsConfigEntry> = {}
  for (const entry of config) map[entry.config_key] = entry
  return map
}

/** Derive summary stats from the available data. */
function buildStats(
  pointsConfig: KickPointsConfigEntry[],
  adminConfig: KickAdminConfig | null,
  broadcasterStatus: BroadcasterStatus | null,
): Stats {
  return {
    activeVips: adminConfig?.vip.stats.active_vips ?? 0,
    expiredVips: adminConfig?.vip.stats.expired_vips ?? 0,
    migratedUsers: adminConfig?.migration.stats.migrated_users ?? 0,
    totalPointsMigrated: adminConfig?.migration.stats.total_points_migrated ?? 0,
    configEntries: pointsConfig.length,
    broadcasterOnline: broadcasterStatus?.connected ?? false,
  }
}

/** Build the initial points-values map from the config entries. */
function buildPointsValues(config: KickPointsConfigEntry[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const entry of config) map[entry.config_key] = entry.config_value
  return map
}

/** Build the initial points-enabled map from the config entries. */
function buildPointsEnabled(config: KickPointsConfigEntry[]): Record<string, boolean> {
  const map: Record<string, boolean> = {}
  for (const entry of config) map[entry.config_key] = entry.enabled
  return map
}

/** Build the initial VIP config from the admin config. */
function buildVipConfig(adminConfig: KickAdminConfig | null): VipConfigState {
  return {
    enabled: adminConfig?.vip.points_enabled ?? false,
    chat: adminConfig?.vip.chat_points ?? 0,
    follow: adminConfig?.vip.follow_points ?? 0,
    sub: adminConfig?.vip.sub_points ?? 0,
  }
}

/** Encapsulates all Kick config state, effects, and action handlers. */
function useKickConfig(
  pointsConfig: KickPointsConfigEntry[],
  adminConfig: KickAdminConfig | null,
  t: KickDict,
) {
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  // Auto-dismiss feedback after a delay.
  useEffect(() => {
    if (!feedback) return
    const timer = window.setTimeout(() => setFeedback(null), FEEDBACK_TIMEOUT_MS)
    return () => window.clearTimeout(timer)
  }, [feedback])

  // Local state for points config editing
  const [pointsValues, setPointsValues] = useState<Record<string, number>>(() =>
    buildPointsValues(pointsConfig),
  )

  // Local state for per-entry enabled toggles
  const [pointsEnabled, setPointsEnabled] = useState<Record<string, boolean>>(() =>
    buildPointsEnabled(pointsConfig),
  )

  // Local state for VIP config
  const [vipConfig, setVipConfig] = useState<VipConfigState>(() =>
    buildVipConfig(adminConfig),
  )

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
          : { ok: true, msg: interpolate(t.feedbackMsgs.savedKey, { key }) },
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
          : { ok: true, msg: interpolate(t.feedbackMsgs.keyState, { key, state: newValue ? t.enabled : t.disabled }) },
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
          : { ok: true, msg: t.feedbackMsgs.vipSaved },
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
          : { ok: true, msg: interpolate(t.feedbackMsgs.migrationState, { state: newValue ? t.enabled : t.disabled }) },
      )
    })
  }

  return {
    pending,
    feedback,
    setFeedback,
    pointsValues,
    setPointsValues,
    pointsEnabled,
    vipConfig,
    setVipConfig,
    migrationEnabled,
    handleSavePoints,
    handleToggleEnabled,
    handleSaveVip,
    handleToggleMigration,
  }
}

export function KickConfigView({
  pointsConfig,
  adminConfig,
  broadcasterStatus,
}: Readonly<{
  pointsConfig: KickPointsConfigEntry[]
  adminConfig: KickAdminConfig | null
  broadcasterStatus: BroadcasterStatus | null
}>) {
  const { dictionary } = useI18n()
  const {
    pending,
    feedback,
    setFeedback,
    pointsValues,
    setPointsValues,
    pointsEnabled,
    vipConfig,
    setVipConfig,
    migrationEnabled,
    handleSavePoints,
    handleToggleEnabled,
    handleSaveVip,
    handleToggleMigration,
  } = useKickConfig(pointsConfig, adminConfig, dictionary.admin.kick)

  const stats = buildStats(pointsConfig, adminConfig, broadcasterStatus)
  const configMap = buildConfigMap(pointsConfig)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <ConfigHeader broadcasterOnline={stats.broadcasterOnline} />

      {/* Stats summary */}
      <StatsGrid stats={stats} />

      {/* Feedback banner */}
      {feedback && (
        <FeedbackBanner feedback={feedback} onDismiss={() => setFeedback(null)} />
      )}

      {/* Broadcaster status card */}
      <BroadcasterStatusCard broadcasterStatus={broadcasterStatus} />

      {/* Points configuration — grouped by category */}
      {pointsConfig.length > 0 && (
        <PointsConfigSection
          configMap={configMap}
          pointsValues={pointsValues}
          setPointsValues={setPointsValues}
          pointsEnabled={pointsEnabled}
          pending={pending}
          onToggleEnabled={handleToggleEnabled}
          onSavePoints={handleSavePoints}
        />
      )}

      {/* VIP configuration */}
      <VipConfigSection
        vipConfig={vipConfig}
        setVipConfig={setVipConfig}
        pending={pending}
        onSaveVip={handleSaveVip}
        adminConfig={adminConfig}
      />

      {/* Migration */}
      {adminConfig && (
        <MigrationSection
          adminConfig={adminConfig}
          migrationEnabled={migrationEnabled}
          pending={pending}
          onToggleMigration={handleToggleMigration}
        />
      )}
    </div>
  )
}

// ─── Sub-components ───

function ConfigHeader({ broadcasterOnline }: Readonly<{ broadcasterOnline: boolean }>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.kick
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-sm bg-foreground">
        <KickLogo className="size-5 text-background" />
      </div>
      <div className="flex min-w-0 flex-col">
        <h1 className="text-[15px] font-medium text-foreground">
          {t.title}
        </h1>
        <span className="text-[13px] text-muted-foreground">
          {t.headerSubtitle}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5">
        <span
          className={cn(
            "size-2 rounded-full",
            broadcasterOnline ? "bg-gold-bright" : "bg-muted-foreground",
          )}
          aria-hidden="true"
        />
        <span className="text-[12px] font-medium text-foreground">
          {broadcasterOnline ? t.broadcasterOnline : t.broadcasterOffline}
        </span>
      </div>
    </div>
  )
}

function StatsGrid({ stats }: Readonly<{ stats: Stats }>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.kick
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        icon={<Activity className="size-3.5" />}
        label={t.stats.broadcaster}
        value={stats.broadcasterOnline ? t.online : t.offline}
        valueClass={stats.broadcasterOnline ? "text-gold-bright" : "text-muted-foreground"}
      />
      <StatCard
        icon={<Coins className="size-3.5" />}
        label={t.stats.configEntries}
        value={String(stats.configEntries)}
      />
      <StatCard
        icon={<Crown className="size-3.5" />}
        label={t.stats.activeVips}
        value={String(stats.activeVips)}
        valueClass="text-gold-bright"
      />
      <StatCard
        icon={<Crown className="size-3.5" />}
        label={t.stats.expiredVips}
        value={String(stats.expiredVips)}
        valueClass="text-muted-foreground"
      />
      <StatCard
        icon={<Users className="size-3.5" />}
        label={t.stats.migratedUsers}
        value={formatCompactNumber(stats.migratedUsers)}
      />
      <StatCard
        icon={<ArrowRightLeft className="size-3.5" />}
        label={t.stats.pointsMigrated}
        value={formatCompactNumber(stats.totalPointsMigrated)}
      />
    </div>
  )
}

function FeedbackBanner({
  feedback,
  onDismiss,
}: Readonly<{ feedback: FeedbackState; onDismiss: () => void }>) {
  const { dictionary } = useI18n()
  return (
    <output
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
        onClick={onDismiss}
        className="text-muted-foreground transition-colors hover:text-foreground"
        aria-label={dictionary.admin.kick.dismiss}
      >
        <XCircle className="size-3.5" aria-hidden="true" />
      </button>
    </output>
  )
}

function BroadcasterStatusCard({
  broadcasterStatus,
}: Readonly<{ broadcasterStatus: BroadcasterStatus | null }>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.kick
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Radio className="size-4 text-gold-bright" aria-hidden="true" />
        <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
          {t.broadcasterStatus}
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
              : t.notConnected}
          </span>
          <span className="text-[12px] text-muted-foreground">
            {broadcasterStatus?.broadcaster
              ? interpolate(t.connectedAt, { date: formatTimestamp(broadcasterStatus.broadcaster.connected_at) })
              : t.noBroadcaster}
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
            <span className="text-[11px] text-muted-foreground">{t.token}</span>
            <span
              className={cn(
                "text-[12px] font-medium",
                broadcasterStatus.token.is_expired
                  ? "text-destructive"
                  : "text-foreground",
              )}
            >
              {broadcasterStatus.token.is_expired ? t.expired : t.valid}
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
            {broadcasterStatus?.connected ? t.online : t.offline}
          </span>
        </div>
      </div>
    </div>
  )
}

function PointsConfigSection({
  configMap,
  pointsValues,
  setPointsValues,
  pointsEnabled,
  pending,
  onToggleEnabled,
  onSavePoints,
}: Readonly<{
  configMap: Record<string, KickPointsConfigEntry>
  pointsValues: Record<string, number>
  setPointsValues: React.Dispatch<React.SetStateAction<Record<string, number>>>
  pointsEnabled: Record<string, boolean>
  pending: boolean
  onToggleEnabled: (key: string) => void
  onSavePoints: (key: string) => void
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.kick
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Coins className="size-4 text-gold-bright" aria-hidden="true" />
        <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
          {t.pointsConfig}
        </span>
      </div>

      {POINTS_CATEGORIES.map((category) => {
        const CategoryIcon = category.icon
        // Only render categories that have at least one matching config entry
        const visibleKeys = category.keys.filter((k) => configMap[k])
        if (visibleKeys.length === 0) return null

        return (
          <div key={category.label(t)} className="flex flex-col gap-2">
            {/* Category header */}
            <div className="flex items-center gap-2 border-b border-border/60 pb-1.5">
              <CategoryIcon className="size-3.5 text-muted-foreground" aria-hidden="true" />
              <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">
                {category.label(t)}
              </span>
            </div>

            {/* Config rows */}
            <div className="flex flex-col gap-1">
              {visibleKeys.map((cfgKey) => {
                const entry = configMap[cfgKey]
                const cfg = t.keys[cfgKey]
                const isEnabled = pointsEnabled[cfgKey] ?? entry.enabled
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
                      onClick={() => onToggleEnabled(cfgKey)}
                      disabled={pending}
                      className="flex shrink-0 items-center gap-1.5"
                      aria-label={interpolate(t.toggleAria, { name: cfg.label })}
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
                        {isEnabled ? t.active : t.off}
                      </span>
                    </button>

                    {/* Value input */}
                    <input
                      type="number"
                      value={pointsValues[cfgKey] ?? 0}
                      onChange={(e) =>
                        setPointsValues((prev) => ({
                          ...prev,
                          [cfgKey]: Number(e.target.value),
                        }))
                      }
                      disabled={!isEnabled}
                      className="h-8 w-20 shrink-0 rounded-sm border border-border bg-background px-3 text-right text-[14px] tabular-nums text-foreground focus:border-gold focus:outline-none disabled:opacity-50"
                    />

                    {/* Save button */}
                    <button
                      type="button"
                      onClick={() => onSavePoints(cfgKey)}
                      disabled={pending}
                      className="flex h-8 w-16 shrink-0 items-center justify-center gap-1 rounded-full bg-foreground px-2 text-[11px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
                    >
                      <Save className="size-3" aria-hidden="true" />
                      {t.save}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function VipConfigSection({
  vipConfig,
  setVipConfig,
  pending,
  onSaveVip,
  adminConfig,
}: Readonly<{
  vipConfig: VipConfigState
  setVipConfig: React.Dispatch<React.SetStateAction<VipConfigState>>
  pending: boolean
  onSaveVip: () => void
  adminConfig: KickAdminConfig | null
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.kick
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Crown className="size-4 text-gold-bright" aria-hidden="true" />
        <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
          {t.vipConfig}
        </span>
      </div>

      {/* VIP toggle */}
      <button
        type="button"
        onClick={() => setVipConfig((prev) => ({ ...prev, enabled: !prev.enabled }))}
        className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-2.5 transition-colors hover:border-gold/40"
      >
        <span className="text-[13px] font-medium text-foreground">
          {t.vip.pointsEnabled}
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
          label={t.vip.chatPoints}
          value={vipConfig.chat}
          onChange={(v) => setVipConfig((prev) => ({ ...prev, chat: v }))}
        />
        <VipField
          label={t.vip.followPoints}
          value={vipConfig.follow}
          onChange={(v) => setVipConfig((prev) => ({ ...prev, follow: v }))}
        />
        <VipField
          label={t.vip.subPoints}
          value={vipConfig.sub}
          onChange={(v) => setVipConfig((prev) => ({ ...prev, sub: v }))}
        />
      </div>

      {/* VIP stats */}
      {adminConfig && (
        <div className="flex flex-wrap gap-4 rounded-sm border border-border bg-background px-3 py-2.5 text-[12px] text-muted-foreground">
          <span>
            {t.vip.activeVips}:{" "}
            <span className="font-medium text-gold-bright">
              {adminConfig.vip.stats.active_vips}
            </span>
          </span>
          <span>
            {t.vip.expired}:{" "}
            <span className="font-medium text-foreground">
              {adminConfig.vip.stats.expired_vips}
            </span>
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={onSaveVip}
        disabled={pending}
        className="flex h-9 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        <Save className="size-3.5" aria-hidden="true" />
        {pending ? t.saving : t.vip.saveConfig}
      </button>
    </div>
  )
}

function MigrationSection({
  adminConfig,
  migrationEnabled,
  pending,
  onToggleMigration,
}: Readonly<{
  adminConfig: KickAdminConfig
  migrationEnabled: boolean
  pending: boolean
  onToggleMigration: () => void
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.kick
  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-secondary p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <ArrowRightLeft className="size-4 text-gold-bright" aria-hidden="true" />
        <span className="text-[13px] font-medium uppercase tracking-wide text-muted-foreground">
          {t.migration.title}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-border bg-background px-3 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] font-medium text-foreground">
            {t.migrationStatus}
          </span>
          <span className="text-[12px] text-muted-foreground">
            {interpolate(t.migration.usersMigrated, { users: formatCompactNumber(adminConfig.migration.stats.migrated_users) })}
            {" - "}
            {interpolate(t.migration.pointsTransferred, { points: formatCompactNumber(adminConfig.migration.stats.total_points_migrated) })}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleMigration}
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
            {migrationEnabled ? t.enabled : t.disabled}
          </span>
        </button>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  valueClass,
}: Readonly<{
  icon: React.ReactNode
  label: string
  value: string
  valueClass?: string
}>) {
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
}: Readonly<{
  label: string
  value: number
  onChange: (v: number) => void
}>) {
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
