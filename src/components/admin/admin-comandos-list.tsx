"use client"

import { useMemo, useState, useTransition } from "react"
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  Zap,
  Terminal,
  X,
  Save,
  Power,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  createBotCommand,
  updateBotCommand,
  toggleBotCommand,
  deleteBotCommand,
  type BotCommandFormData,
} from "@/app/shop/admin/comandos/actions"
import type { BotCommand } from "@/lib/comandos"

type FilterType = "all" | "simple" | "dynamic"

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "simple", label: "Simple" },
  { value: "dynamic", label: "Dynamic" },
]

const PERMISSION_OPTIONS = [
  { value: "viewer", label: "Viewer" },
  { value: "vip", label: "VIP" },
  { value: "moderator", label: "Moderator" },
  { value: "broadcaster", label: "Broadcaster" },
] as const

function emptyForm(): BotCommandFormData {
  return {
    command: "",
    aliases: [],
    response_message: "",
    description: "",
    command_type: "simple",
    enabled: true,
    requires_permission: false,
    permission_level: "viewer",
    cooldown_seconds: 0,
  }
}

function fromCommand(c: BotCommand): BotCommandFormData {
  return {
    command: c.command,
    aliases: c.aliases ?? [],
    response_message: c.response_message,
    description: c.description ?? "",
    command_type: c.command_type,
    enabled: c.enabled,
    requires_permission: c.requires_permission,
    permission_level: c.permission_level,
    cooldown_seconds: c.cooldown_seconds,
  }
}

export function AdminComandosList({ commands }: { commands: BotCommand[] }) {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [pending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState<BotCommandFormData>(emptyForm())
  const [aliasesText, setAliasesText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = [...commands]
    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.command.toLowerCase().includes(term) ||
          c.aliases?.some((a) => a.toLowerCase().includes(term)) ||
          c.description?.toLowerCase().includes(term),
      )
    }
    if (filterType !== "all") {
      result = result.filter((c) => c.command_type === filterType)
    }
    result.sort((a, b) => a.command.localeCompare(b.command))
    return result
  }, [commands, search, filterType])

  const startEdit = (cmd: BotCommand) => {
    setEditingId(cmd.id)
    setCreating(false)
    setFormData(fromCommand(cmd))
    setAliasesText(cmd.aliases?.join(", ") ?? "")
    setError(null)
  }

  const startCreate = () => {
    setCreating(true)
    setEditingId(null)
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

  const handleToggle = (id: number) => {
    startTransition(async () => {
      await toggleBotCommand(String(id))
    })
  }

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete command "!${name}"?`)) return
    startTransition(async () => {
      await deleteBotCommand(String(id))
    })
  }

  const set = <K extends keyof BotCommandFormData>(key: K, value: BotCommandFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const isEditing = creating || editingId !== null

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">Bot Commands</h1>
          <span className="text-[13px] text-muted-foreground">
            {filtered.length} of {commands.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex h-8 items-center">
            <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              aria-label="Search commands"
              className="h-8 w-44 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:w-56 focus:border-gold focus:outline-none transition-all"
            />
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={startCreate}
              className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
            >
              <Plus className="size-3.5" />
              New command
            </button>
          )}
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilterType(opt.value)}
            aria-pressed={filterType === opt.value}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
              filterType === opt.value
                ? "bg-gold text-gold-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Create/Edit form */}
      {isEditing && (
        <div className="flex flex-col gap-4 rounded-sm border border-gold/40 bg-secondary p-4">
          <div className="flex items-center justify-between">
            <span className="text-[14px] font-medium text-foreground">
              {creating ? "New command" : `Edit !${formData.command}`}
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
              <span className="text-[12px] font-medium text-muted-foreground">Command (without !)</span>
              <input
                type="text"
                value={formData.command}
                onChange={(e) => set("command", e.target.value)}
                placeholder="hello"
                className={inputClass}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">Aliases (comma-separated)</span>
              <input
                type="text"
                value={aliasesText}
                onChange={(e) => setAliasesText(e.target.value)}
                placeholder="hi, hey"
                className={inputClass}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">Response message</span>
            <textarea
              value={formData.response_message}
              onChange={(e) => set("response_message", e.target.value)}
              rows={2}
              className="w-full rounded-sm border border-border bg-background px-3 py-2 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
              placeholder="Hello {user}!"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted-foreground">Description (optional)</span>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => set("description", e.target.value)}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">Type</span>
              <select
                value={formData.command_type}
                onChange={(e) => set("command_type", e.target.value as "simple" | "dynamic")}
                className={inputClass}
              >
                <option value="simple">Simple</option>
                <option value="dynamic">Dynamic</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">Permission</span>
              <select
                value={formData.permission_level}
                onChange={(e) => set("permission_level", e.target.value as BotCommandFormData["permission_level"])}
                className={inputClass}
              >
                {PERMISSION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted-foreground">Cooldown (seconds)</span>
              <input
                type="number"
                min={0}
                value={formData.cooldown_seconds}
                onChange={(e) => set("cooldown_seconds", Number(e.target.value))}
                className={inputClass}
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => set("enabled", !formData.enabled)}
              className="flex items-center gap-2"
            >
              <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", formData.enabled ? "bg-gold" : "bg-border")}>
                <span className={cn("size-4 rounded-full bg-background transition-transform", formData.enabled && "translate-x-4")} />
              </span>
              <span className="text-[13px] text-foreground">Enabled</span>
            </button>
            <button
              type="button"
              onClick={() => set("requires_permission", !formData.requires_permission)}
              className="flex items-center gap-2"
            >
              <span className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition-colors", formData.requires_permission ? "bg-gold" : "bg-border")}>
                <span className={cn("size-4 rounded-full bg-background transition-transform", formData.requires_permission && "translate-x-4")} />
              </span>
              <span className="text-[13px] text-foreground">Requires permission</span>
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
              {pending ? "Saving..." : creating ? "Create" : "Save"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex h-9 items-center rounded-full border border-border px-5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Commands list */}
      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border">
          <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="min-w-0 flex-1">Command</span>
            <span className="hidden w-24 shrink-0 sm:block">Type</span>
            <span className="hidden w-24 shrink-0 md:block">Permission</span>
            <span className="w-16 shrink-0 text-right">Uses</span>
            <span className="w-24 shrink-0 text-right">Actions</span>
          </div>
          <div className="flex flex-col">
            {filtered.map((cmd) => (
              <div
                key={cmd.id}
                className={cn(
                  "flex items-center gap-4 border-b border-border/40 px-4 py-3 transition-colors last:border-b-0 hover:bg-secondary/30",
                  !cmd.enabled && "opacity-50",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {cmd.command_type === "dynamic" ? (
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
                <span className="hidden w-24 shrink-0 text-[12px] text-muted-foreground sm:block">
                  {cmd.command_type}
                </span>
                <span className="hidden w-24 shrink-0 text-[12px] capitalize text-muted-foreground md:block">
                  {cmd.permission_level}
                </span>
                <span className="w-16 shrink-0 text-right text-[13px] tabular-nums text-muted-foreground">
                  {cmd.usage_count.toLocaleString()}
                </span>
                <div className="flex w-24 shrink-0 items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(cmd.id)}
                    disabled={pending}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                    aria-label={cmd.enabled ? "Disable" : "Enable"}
                    title={cmd.enabled ? "Disable" : "Enable"}
                  >
                    <Power className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(cmd)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Edit"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(cmd.id, cmd.command)}
                    disabled={pending}
                    className="text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50"
                    aria-label="Delete"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        !isEditing && (
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-border p-8">
            <div className="flex flex-col items-center gap-3">
              <p className="text-[13px] text-muted-foreground">
                {search.trim() ? `No results match "${search.trim()}".` : "No commands yet."}
              </p>
              {!search.trim() && (
                <button
                  type="button"
                  onClick={startCreate}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
                >
                  <Plus className="size-3.5" />
                  Create your first command
                </button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}

const inputClass =
  "h-9 w-full rounded-sm border border-border bg-background px-3 text-[14px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
