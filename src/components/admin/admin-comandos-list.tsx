"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Plus,
  Trash2,
  Pencil,
  Zap,
  Terminal,
  X,
  Save,
  Power,
  CheckCircle2,
  XCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { DrawerBackdrop, OverlayDrawer } from "@/components/overlay-drawer"
import { StatCard } from "@/components/admin/shared/stat-card"
import { SortHeader } from "@/components/admin/shared/sort-header"
import { SearchInput, CsvButton } from "@/components/admin/shared/list-toolbar"
import { Pagination } from "@/components/admin/shared/pagination"
import { useI18n } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"
import type { Dictionary } from "@/lib/i18n/shared"
import { downloadCSV } from "@/lib/admin-csv"
import { PAGE_SIZE_OPTIONS, formatDate } from "@/lib/admin-utils"
import {
  createBotCommand,
  updateBotCommand,
  toggleBotCommand,
  deleteBotCommand,
  type BotCommandFormData,
} from "@/app/[lang]/shop/admin/comandos/actions"
import type { BotCommand } from "@/lib/comandos"

// ─── Types ───

type TypeFilter = "all" | "simple" | "dynamic"
type StatusFilter = "all" | "enabled" | "disabled"
type SortKey = "command" | "type" | "permission" | "uses" | "created" | "status"
type SortDir = "asc" | "desc"
type ComandosDict = Dictionary["admin"]["comandos"]

// ─── Constants ───

const TYPE_OPTIONS: { value: TypeFilter; label: (t: ComandosDict) => string }[] = [
  { value: "all", label: (t) => t.all },
  { value: "simple", label: (t) => t.types.simple },
  { value: "dynamic", label: (t) => t.types.dynamic },
]

const STATUS_OPTIONS: { value: StatusFilter; label: (t: ComandosDict) => string }[] = [
  { value: "all", label: (t) => t.all },
  { value: "enabled", label: (t) => t.status.enabled },
  { value: "disabled", label: (t) => t.status.disabled },
]

const COLUMNS: { key: SortKey; label: (t: ComandosDict) => string; className: string }[] = [
  { key: "command", label: (t) => t.columns.comando, className: "min-w-0 flex-1" },
  { key: "type", label: (t) => t.columns.tipo, className: "hidden w-20 shrink-0 sm:flex" },
  { key: "permission", label: (t) => t.columns.permiso, className: "hidden w-24 shrink-0 md:flex" },
  { key: "uses", label: (t) => t.columns.usos, className: "w-16 shrink-0" },
  { key: "created", label: (t) => t.columns.created, className: "hidden w-28 shrink-0 lg:flex" },
  { key: "status", label: (t) => t.columns.estado, className: "w-20 shrink-0" },
]

const PERMISSION_OPTIONS = [
  { value: "viewer", label: (t: ComandosDict) => t.permissions.viewer },
  { value: "vip", label: (t: ComandosDict) => t.permissions.vip },
  { value: "moderator", label: (t: ComandosDict) => t.permissions.moderator },
  { value: "broadcaster", label: (t: ComandosDict) => t.permissions.broadcaster },
] as const

// ─── Helpers ───

function formatDateLong(d: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d))
}

function formatRelative(d: string | null | undefined, t: ComandosDict): string {
  if (!d) return t.time.never
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60_000) return t.time.justNow
  if (diff < 3_600_000) return interpolate(t.time.minutesAgo, { n: Math.floor(diff / 60_000) })
  if (diff < 86_400_000) return interpolate(t.time.hoursAgo, { n: Math.floor(diff / 3_600_000) })
  if (diff < 30 * 86_400_000) return interpolate(t.time.daysAgo, { n: Math.floor(diff / 86_400_000) })
  return formatDate(d)
}

function FilterSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: Readonly<{
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}>) {
  return (
    <label className="flex items-center gap-2 text-[12px] text-muted-foreground">
      <span>{label}</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-label={label}
          className="h-7 appearance-none rounded-full border border-border bg-secondary pl-3 pr-7 text-[12px] font-medium text-foreground focus:border-gold focus:outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
      </span>
    </label>
  )
}

function emptyForm(): BotCommandFormData {
  return {
    command: "",
    aliases: [],
    response_message: "",
    description: "",
    command_type: "simple",
    dynamic_handler: null,
    enabled: true,
    requires_permission: false,
    permission_level: "viewer",
    cooldown_seconds: 0,
    auto_send_interval_seconds: 0,
  }
}

function fromCommand(c: BotCommand): BotCommandFormData {
  return {
    command: c.command,
    aliases: c.aliases ?? [],
    response_message: c.response_message,
    description: c.description ?? "",
    command_type: c.command_type,
    dynamic_handler: c.dynamic_handler ?? null,
    enabled: c.enabled,
    requires_permission: c.requires_permission,
    permission_level: c.permission_level ?? "viewer",
    cooldown_seconds: c.cooldown_seconds,
    auto_send_interval_seconds: c.auto_send_interval_seconds ?? 0,
  }
}

/** Generate CSV from commands array and trigger download. */
function exportCSV(commands: BotCommand[], t: ComandosDict): void {
  const headers = [
    "ID", t.csv.command, t.csv.aliases, t.csv.type, t.csv.responseMessage, t.csv.description,
    t.csv.enabled, t.csv.permission, t.csv.requiresPermission, t.csv.cooldown,
    t.csv.autoSend, t.csv.usageCount, t.csv.lastUsed, t.csv.created, t.csv.updated,
  ]
  const rows = commands.map((c) => [
    c.id,
    c.command,
    (c.aliases ?? []).join(" | "),
    c.command_type,
    c.response_message,
    c.description ?? "",
    c.enabled ? "yes" : "no",
    c.permission_level,
    c.requires_permission ? "yes" : "no",
    c.cooldown_seconds,
    c.auto_send_interval_seconds ?? 0,
    c.usage_count,
    c.last_used_at ? new Date(c.last_used_at).toISOString() : "",
    new Date(c.created_at).toISOString(),
    new Date(c.updated_at).toISOString(),
  ])
  downloadCSV("bot-commands", headers, rows)
}

// ─── Component ───

export function AdminComandosList({ commands: initialCommands }: Readonly<{ commands: BotCommand[] }>) {
  const router = useRouter()
  const { dictionary } = useI18n()
  const t = dictionary.admin.comandos
  const [commands, setCommands] = useState<BotCommand[]>(initialCommands)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sortKey, setSortKey] = useState<SortKey>("command")
  const [sortDir, setSortDir] = useState<SortDir>("asc")
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [pending, startTransition] = useTransition()

  // Detail drawer — stores index into filtered list for prev/next nav
  const [drawerIndex, setDrawerIndex] = useState<number | null>(null)

  // Inline create/edit form
  const [editingId, setEditingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState<BotCommandFormData>(emptyForm())
  const [aliasesText, setAliasesText] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Sync with server-refreshed data using the "adjust state during render"
  // pattern from React docs (avoids setState-in-effect lint violation).
  const [prevInitialCommands, setPrevInitialCommands] = useState(initialCommands)
  if (initialCommands !== prevInitialCommands) {
    setPrevInitialCommands(initialCommands)
    setCommands(initialCommands)
  }

  // ─── Stats ───
  const stats = useMemo(() => {
    const total = commands.length
    const enabled = commands.filter((c) => c.enabled).length
    const disabled = commands.filter((c) => !c.enabled).length
    const simple = commands.filter((c) => c.command_type === "simple").length
    const dynamic = commands.filter((c) => c.command_type === "dynamic").length
    return { total, enabled, disabled, simple, dynamic }
  }, [commands])

  // ─── Filter + sort ───
  const filtered = useMemo(() => {
    let result = [...commands]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.command.toLowerCase().includes(term) ||
          c.aliases?.some((a) => a.toLowerCase().includes(term)) ||
          c.description?.toLowerCase().includes(term) ||
          c.response_message.toLowerCase().includes(term),
      )
    }
    if (typeFilter !== "all") {
      result = result.filter((c) => c.command_type === typeFilter)
    }
    if (statusFilter !== "all") {
      result = result.filter((c) =>
        statusFilter === "enabled" ? c.enabled : !c.enabled,
      )
    }
    result.sort((a, b) => {
      let cmp = 0
      switch (sortKey) {
        case "command": cmp = a.command.localeCompare(b.command); break
        case "type": cmp = a.command_type.localeCompare(b.command_type); break
        case "permission": cmp = (a.permission_level ?? "viewer").localeCompare(b.permission_level ?? "viewer"); break
        case "uses": cmp = a.usage_count - b.usage_count; break
        case "created": cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
        case "status": cmp = Number(a.enabled) - Number(b.enabled); break
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return result
  }, [commands, search, typeFilter, statusFilter, sortKey, sortDir])

  // ─── Pagination ───
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir(key === "uses" || key === "created" ? "desc" : "asc")
    }
  }

  // ─── Optimistic update helper ───
  const optimisticToggle = useCallback((id: number) => {
    setCommands((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)),
    )
  }, [])

  // ─── Actions ───
  const handleToggle = (id: number) => {
    optimisticToggle(id)
    startTransition(async () => {
      const result = await toggleBotCommand(String(id))
      if (result.error) {
        router.refresh()
      }
    })
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(interpolate(t.confirmDeleteCmd, { name }))) return
    startTransition(async () => {
      await deleteBotCommand(String(id))
    })
  }

  const startEdit = (cmd: BotCommand) => {
    setEditingId(cmd.id)
    setCreating(false)
    setDrawerIndex(null)
    setFormData(fromCommand(cmd))
    setAliasesText(cmd.aliases?.join(", ") ?? "")
    setError(null)
  }

  const startCreate = () => {
    setCreating(true)
    setEditingId(null)
    setDrawerIndex(null)
    setFormData(emptyForm())
    setAliasesText("")
    setError(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setCreating(false)
    setFormData(emptyForm())
    setAliasesText("")
    setError(null)
  }

  const handleSave = () => {
    setError(null)
    const data: BotCommandFormData = {
      ...formData,
      aliases: aliasesText.split(",").map((a) => a.trim()).filter(Boolean),
    }
    startTransition(async () => {
      let result: { error?: string }
      if (creating) {
        result = await createBotCommand(data)
      } else if (editingId !== null) {
        result = await updateBotCommand(String(editingId), data)
      } else {
        return
      }
      if (result.error) {
        setError(result.error)
      } else {
        cancelEdit()
      }
    })
  }

  const set = <K extends keyof BotCommandFormData>(key: K, value: BotCommandFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const isEditing = creating || editingId !== null

  // Reset page when filters change
  const onSearchChange = (v: string) => { setSearch(v); setCurrentPage(1) }
  const onTypeChange = (v: TypeFilter) => { setTypeFilter(v); setCurrentPage(1) }
  const onStatusChange = (v: StatusFilter) => { setStatusFilter(v); setCurrentPage(1) }
  const onPageSizeChange = (s: (typeof PAGE_SIZE_OPTIONS)[number]) => { setPageSize(s); setCurrentPage(1) }

  let saveLabel = t.form.save
  if (pending) saveLabel = t.form.saving
  else if (creating) saveLabel = t.form.create

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-6 transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          drawerIndex !== null && "2xl:translate-x-[292px]",
        )}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h1 className="text-[15px] font-medium text-foreground">{t.title}</h1>
            <span className="text-[13px] text-muted-foreground">
              {interpolate(t.countOf, { shown: filtered.length, total: commands.length })}
            </span>
          </div>
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-3">
            <SearchInput
              value={search}
              onChange={onSearchChange}
              placeholder={t.searchPlaceholder}
              ariaLabel={t.searchAria}
              widthClassName="sm:w-44 sm:focus:w-56"
            />
            <CsvButton onClick={() => exportCSV(filtered, t)} />
            {!isEditing && (
              <button
                type="button"
                onClick={startCreate}
                className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
              >
                <Plus className="size-3.5" />
                {t.newCommand}
              </button>
            )}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard icon={<Terminal className="size-3.5" />} label={t.stats.total} value={stats.total} />
          <StatCard icon={<CheckCircle2 className="size-3.5" />} label={t.stats.enabled} value={stats.enabled} valueClass="text-gold-bright" />
          <StatCard icon={<XCircle className="size-3.5" />} label={t.stats.disabled} value={stats.disabled} valueClass="text-muted-foreground" />
          <StatCard icon={<Terminal className="size-3.5" />} label={t.stats.simple} value={stats.simple} />
          <StatCard icon={<Zap className="size-3.5" />} label={t.stats.dynamic} value={stats.dynamic} valueClass="text-gold-bright" />
        </div>

        {/* Filters row: compact labeled menus for the two independent filters. */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <FilterSelect
            label={t.columns.tipo}
            options={TYPE_OPTIONS.map((o) => ({ ...o, label: o.label(t) }))}
            value={typeFilter}
            onChange={onTypeChange}
          />
          <FilterSelect
            label={t.columns.estado}
            options={STATUS_OPTIONS.map((o) => ({ ...o, label: o.label(t) }))}
            value={statusFilter}
            onChange={onStatusChange}
          />
        </div>

        {/* Create/Edit form */}
        {isEditing && (
          <div className="flex flex-col gap-4 rounded-sm border border-gold/40 bg-secondary p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14px] font-medium text-foreground">
                {creating ? t.newCommand : interpolate(t.form.editTitle, { name: formData.command })}
              </span>
              <button type="button" onClick={cancelEdit} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            {error && (
              <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] text-destructive">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">{t.form.command}</span>
                <input
                  type="text"
                  value={formData.command}
                  onChange={(e) => set("command", e.target.value)}
                  placeholder={t.form.commandPlaceholder}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">{t.form.aliases}</span>
                <input
                  type="text"
                  value={aliasesText}
                  onChange={(e) => setAliasesText(e.target.value)}
                  placeholder={t.form.aliasesPlaceholder}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">{t.form.responseMessage}</span>
              <textarea
                value={formData.response_message}
                onChange={(e) => set("response_message", e.target.value)}
                rows={2}
                className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
                placeholder={t.form.responsePlaceholder}
              />
              <span className="text-[11px] text-muted-foreground">
                {t.form.variablesHint}
              </span>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">{t.form.descriptionOptional}</span>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => set("description", e.target.value)}
                className={inputClass}
              />
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">{t.drawer.type}</span>
                <select
                  value={formData.command_type}
                  onChange={(e) => set("command_type", e.target.value as "simple" | "dynamic")}
                  className={inputClass}
                >
                  <option value="simple">{t.types.simple}</option>
                  <option value="dynamic">{t.types.dynamic}</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">{t.form.permission}</span>
                <select
                  value={formData.permission_level}
                  onChange={(e) => set("permission_level", e.target.value as BotCommandFormData["permission_level"])}
                  className={inputClass}
                >
                  {PERMISSION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label(t)}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">{t.form.cooldown}</span>
                <input
                  type="number"
                  min={0}
                  value={formData.cooldown_seconds}
                  onChange={(e) => set("cooldown_seconds", Number(e.target.value))}
                  className={inputClass}
                />
              </label>
            </div>

            {formData.command_type === "dynamic" && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted-foreground">{t.form.dynamicHandlerLabel}</span>
                <input
                  type="text"
                  value={formData.dynamic_handler ?? ""}
                  onChange={(e) => set("dynamic_handler", e.target.value || null)}
                  placeholder={t.form.handlerPlaceholder}
                  className={inputClass}
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">{t.form.autoSend}</span>
              <input
                type="number"
                min={0}
                value={formData.auto_send_interval_seconds}
                onChange={(e) => set("auto_send_interval_seconds", Number(e.target.value))}
                className={inputClass}
              />
            </label>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => set("enabled", !formData.enabled)}
                className="flex items-center gap-2"
              >
                <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", formData.enabled ? "bg-gold" : "bg-border")}>
                  <span className={cn("size-4 rounded-full bg-background transition-transform", formData.enabled && "translate-x-4")} />
                </span>
                <span className="text-[13px] text-foreground">{t.form.enabled}</span>
              </button>
              <button
                type="button"
                onClick={() => set("requires_permission", !formData.requires_permission)}
                className="flex items-center gap-2"
              >
                <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", formData.requires_permission ? "bg-gold" : "bg-border")}>
                  <span className={cn("size-4 rounded-full bg-background transition-transform", formData.requires_permission && "translate-x-4")} />
                </span>
                <span className="text-[13px] text-foreground">{t.form.requiresPermission}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={pending || !formData.command || !formData.response_message}
                className="flex h-9 items-center gap-2 rounded-full bg-foreground px-5 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                <Save className="size-3.5" />
                {saveLabel}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex h-9 items-center rounded-full border border-border px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
              >
                {t.form.cancel}
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {paginated.length > 0 ? (
          <section className="overflow-x-auto overscroll-x-contain rounded-lg border border-border" aria-label={t.title}>
            {/* Column headers */}
            <SortHeader
              columns={COLUMNS.map((c) => ({ ...c, label: c.label(t), alignRight: c.key === "uses" }))}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
              leadingLabel="ID"
              trailingLabel={t.actions}
            />

            {/* Rows */}
            <div className="flex flex-col">
              {paginated.map((cmd) => {
                const isDynamic = cmd.command_type === "dynamic"
                return (
                  <div
                    key={cmd.id}
                    role="button"
                    tabIndex={0}
                    className={cn(
                      "flex min-w-[960px] cursor-pointer items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30",
                      !cmd.enabled && "opacity-50",
                    )}
                    onClick={() => setDrawerIndex(filtered.indexOf(cmd))}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDrawerIndex(filtered.indexOf(cmd)) } }}
                  >
                    {/* ID */}
                    <span className="w-8 shrink-0 text-[13px] tabular-nums text-muted-foreground">
                      #{cmd.id}
                    </span>

                    {/* Command + description + aliases */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {isDynamic ? (
                          <Zap className="size-3.5 shrink-0 text-gold-bright" />
                        ) : (
                          <Terminal className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span className="font-mono text-[14px] font-medium text-foreground">
                          !{cmd.command}
                        </span>
                      </div>
                      {cmd.description && (
                        <p className="mt-0.5 truncate pl-6 text-[12px] text-muted-foreground">
                          {cmd.description}
                        </p>
                      )}
                      {cmd.aliases && cmd.aliases.length > 0 && (
                        <div className="mt-0.5 flex flex-wrap gap-1 pl-6">
                          {cmd.aliases.map((a) => (
                            <span key={a} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                              !{a}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Type */}
                    <span className="hidden w-20 shrink-0 text-[12px] capitalize text-muted-foreground sm:block">
                      {t.types[cmd.command_type as keyof ComandosDict["types"]] ?? cmd.command_type}
                    </span>

                    {/* Permission */}
                    <span className="hidden w-24 shrink-0 text-[12px] capitalize text-muted-foreground md:block">
                      {t.permissions[(cmd.permission_level ?? "viewer") as keyof ComandosDict["permissions"]] ?? cmd.permission_level}
                    </span>

                    {/* Uses */}
                    <span className="w-16 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
                      {cmd.usage_count.toLocaleString()}
                    </span>

                    {/* Created */}
                    <span className="hidden w-28 shrink-0 text-[12px] text-muted-foreground lg:block">
                      {formatDate(cmd.created_at)}
                    </span>

                    {/* Status */}
                    <div className="flex w-20 shrink-0 items-center gap-1 text-[12px] font-medium">
                      {cmd.enabled ? (
                        <>
                          <CheckCircle2 className="size-3 shrink-0 text-gold-bright" aria-hidden="true" />
                          <span className="text-gold-bright">{t.on}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="text-muted-foreground">{t.off}</span>
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex w-24 shrink-0 items-center justify-end gap-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleToggle(cmd.id)}
                        disabled={pending}
                        className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                        aria-label={cmd.enabled ? t.disable : t.enable}
                        title={cmd.enabled ? t.disable : t.enable}
                      >
                        <Power className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(cmd)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={t.edit}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(cmd.id, cmd.command)}
                        disabled={pending}
                        className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                        aria-label={t.delete}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={filtered.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={onPageSizeChange}
            />
          </section>
        ) : (
          !isEditing && (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-[13px] text-muted-foreground">
                  {search.trim() ? interpolate(t.emptySearch, { query: search.trim() }) : t.empty}
                </p>
                {!search.trim() && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
                  >
                    <Plus className="size-3.5" />
                    {t.createFirst}
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* ─── Detail drawer (outside the shifting div so fixed positioning
          is relative to the viewport, not the transformed parent) ─── */}
      {drawerIndex !== null && drawerIndex >= 0 && drawerIndex < filtered.length && (
        <DetailDrawer
          commands={filtered}
          index={drawerIndex}
          onClose={() => setDrawerIndex(null)}
          onNavigate={(nextIndex) => setDrawerIndex(nextIndex)}
          onEdit={(cmd) => startEdit(cmd)}
          onDelete={(cmd) => handleDelete(cmd.id, cmd.command)}
          onToggle={(id) => handleToggle(id)}
          pending={pending}
        />
      )}
    </>
  )
}

// ─── Detail drawer ───

function DetailDrawer({
  commands,
  index,
  onClose,
  onNavigate,
  onEdit,
  onDelete,
  onToggle,
  pending,
}: Readonly<{
  commands: BotCommand[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
  onEdit: (cmd: BotCommand) => void
  onDelete: (cmd: BotCommand) => void
  onToggle: (id: number) => void
  pending: boolean
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.comandos
  const cmd = commands[index]
  const isDynamic = cmd.command_type === "dynamic"

  const statRows = [
    { label: t.drawer.type, value: t.types[cmd.command_type as keyof ComandosDict["types"]] ?? cmd.command_type },
    { label: t.drawer.status, value: cmd.enabled ? t.status.enabled : t.status.disabled },
    { label: t.drawer.permission, value: t.permissions[(cmd.permission_level ?? "viewer") as keyof ComandosDict["permissions"]] ?? cmd.permission_level },
    { label: t.drawer.requiresPermission, value: cmd.requires_permission ? t.yes : t.no },
    { label: t.drawer.cooldown, value: interpolate(t.drawer.seconds, { n: cmd.cooldown_seconds }) },
    { label: t.drawer.autoSendInterval, value: cmd.auto_send_interval_seconds > 0 ? interpolate(t.drawer.seconds, { n: cmd.auto_send_interval_seconds }) : t.off },
    ...(isDynamic && cmd.dynamic_handler ? [{ label: t.drawer.dynamicHandler, value: cmd.dynamic_handler }] : []),
    { label: t.drawer.usageCount, value: cmd.usage_count.toLocaleString() },
    { label: t.drawer.lastUsed, value: formatRelative(cmd.last_used_at, t) },
    { label: t.drawer.created, value: formatDateLong(cmd.created_at) },
    { label: t.drawer.updated, value: formatDateLong(cmd.updated_at) },
  ]

  return (
    <>
      {/* Static metadata sidebar — always opaque, sits at z-50 above the
          backdrop so it can never be tinted by it. The "slide-in" illusion is
          created by the table shifting right. Matches ProductDetailOverlay's
          layering. */}
      <OverlayDrawer
        ariaLabel={interpolate(t.commandAria, { name: cmd.command })}
        index={index}
        count={commands.length}
        onClose={onClose}
        onNavigate={onNavigate}
        labels={{ close: t.drawer.close, previous: t.drawer.previous, next: t.drawer.next }}
        showCounter
        footer={
          /* Footer — toggle + edit + delete */
          <div className="shrink-0 border-t border-border px-4 py-3 lg:px-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggle(cmd.id)}
                disabled={pending}
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full border border-border text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                <Power className="size-3.5" />
                {cmd.enabled ? t.disable : t.enable}
              </button>
              <button
                type="button"
                onClick={() => onEdit(cmd)}
                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-[13px] font-medium text-background transition-opacity hover:opacity-85"
              >
                <Pencil className="size-3.5" />
                {t.edit}
              </button>
              <button
                type="button"
                onClick={() => onDelete(cmd)}
                disabled={pending}
                className="flex size-9 shrink-0 items-center justify-center rounded-full border border-destructive/40 text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                aria-label={t.delete}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        }
      >
        {/* Scrollable content */}
        <div key={cmd.id} className="overlay-content flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-6 lg:px-5">
          {/* Title + status */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tabular-nums text-muted-foreground">#{cmd.id}</span>
              {cmd.enabled ? (
                <div className="flex items-center gap-1 text-[12px] font-medium text-gold-bright">
                  <CheckCircle2 className="size-3" aria-hidden="true" />
                  {t.status.enabled}
                </div>
              ) : (
                <div className="flex items-center gap-1 text-[12px] font-medium text-muted-foreground">
                  <XCircle className="size-3" aria-hidden="true" />
                  {t.status.disabled}
                </div>
              )}
              {isDynamic && (
                <span className="rounded-full bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold text-gold-bright">
                  DYNAMIC
                </span>
              )}
            </div>
            <h2 className="font-mono text-[18px] font-semibold leading-tight text-foreground">
              !{cmd.command}
            </h2>
            {cmd.description && (
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {cmd.description}
              </p>
            )}
          </div>

          {/* Aliases */}
          {cmd.aliases && cmd.aliases.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {t.drawer.aliases}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {cmd.aliases.map((a) => (
                  <span key={a} className="rounded bg-secondary px-2 py-1 font-mono text-[12px] text-foreground">
                    !{a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Response message */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <MessageSquare className="size-3" />
              {t.drawer.responseMessage}
            </div>
            <div className="rounded-sm border border-border bg-secondary p-3">
              <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {cmd.response_message}
              </p>
            </div>
          </div>

          {/* Key-value stats */}
          <div className="flex flex-col gap-0">
            <span className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {t.drawer.details}
            </span>
            {statRows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-3 border-b border-border/40 py-1.5 last:border-b-0">
                <span className="text-[12px] text-muted-foreground">{row.label}</span>
                <span className="text-right text-[13px] font-medium capitalize text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </OverlayDrawer>

      <DrawerBackdrop onClose={onClose} />
    </>
  )
}

// ─── Sub-components ───

const inputClass =
  "h-9 w-full rounded-sm border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
