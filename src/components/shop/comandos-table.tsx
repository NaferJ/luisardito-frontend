"use client"

import { useMemo, useState } from "react"
import { Search, X, Terminal, Zap, Shield } from "lucide-react"
import { FilterPills } from "@/components/admin/shared/filter-pills"
import { useI18n } from "@/components/i18n/provider"
import type { Dictionary } from "@/lib/i18n/shared"
import type { BotCommand } from "@/lib/comandos"

type FilterType = "all" | "simple" | "dynamic"
type ComandosDict = Dictionary["comandos"]

function filterOptions(t: ComandosDict): { value: FilterType; label: string }[] {
  return [
    { value: "all", label: t.filters.all },
    { value: "simple", label: t.filters.simple },
    { value: "dynamic", label: t.filters.dynamic },
  ]
}

function permissionLabels(t: ComandosDict): Record<string, string> {
  return {
    viewer: t.permissions.viewer,
    vip: t.permissions.vip,
    moderator: t.permissions.moderator,
    broadcaster: t.permissions.broadcaster,
  }
}

export function ComandosTable({ commands }: Readonly<{ commands: BotCommand[] }>) {
  const { dictionary } = useI18n()
  const t = dictionary.comandos
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")

  const filtered = useMemo(() => {
    let result = commands.filter((c) => c.enabled)
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
    // Sort alphabetically by command name
    result.sort((a, b) => a.command.localeCompare(b.command))
    return result
  }, [commands, search, filterType])

  if (commands.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-border p-8">
        <Terminal className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-[15px] font-medium text-foreground">{t.empty}</p>
        <p className="text-[13px] text-muted-foreground">{t.emptyHint}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-sm border border-border bg-secondary p-3 sm:flex-row sm:items-center">
        <div className="relative flex h-8 items-center sm:max-w-[220px]">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            aria-label={t.searchLabel}
            className="h-8 w-full rounded-full border border-border bg-background pl-8 pr-7 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label={t.clearSearch}
              className="absolute right-2 flex size-4 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <FilterPills
            options={filterOptions(t)}
            value={filterType}
            onChange={setFilterType}
            variant="shop"
          />
        </div>

        <span className="shrink-0 text-[12px] text-muted-foreground sm:ml-auto">
          {filtered.length}/{commands.filter((c) => c.enabled).length}
        </span>
      </div>

      {/* Commands list */}
      {filtered.length === 0 ? (
        <div className="flex min-h-[120px] items-center justify-center rounded-sm border border-dashed border-border p-6">
          <p className="text-[13px] text-muted-foreground">{t.noMatch}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((cmd) => (
            <div
              key={cmd.id}
              className="flex flex-col gap-2 rounded-sm border border-border bg-secondary p-3 transition-colors hover:border-gold/50 sm:flex-row sm:items-center"
            >
              {/* Command name + type */}
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-muted">
                  {cmd.command_type === "dynamic" ? (
                    <Zap className="size-4 text-gold-bright" aria-hidden="true" />
                  ) : (
                    <Terminal className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[14px] font-medium text-foreground">
                      !{cmd.command}
                    </span>
                    {cmd.requires_permission && (
                      <span className="flex items-center gap-0.5 rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-medium text-foreground">
                        <Shield className="size-2.5" aria-hidden="true" />
                        {permissionLabels(t)[cmd.permission_level ?? "viewer"] ?? cmd.permission_level ?? t.permissions.viewer}
                      </span>
                    )}
                  </div>
                  {cmd.description && (
                    <span className="text-[12px] text-muted-foreground">{cmd.description}</span>
                  )}
                  {cmd.aliases && cmd.aliases.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {cmd.aliases.map((alias) => (
                        <span
                          key={alias}
                          className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          !{alias}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Usage + cooldown */}
              <div className="flex shrink-0 items-center gap-4 text-[12px] text-muted-foreground sm:flex-col sm:items-end sm:gap-0.5">
                <span>
                  <span className="font-medium text-foreground">{cmd.usage_count.toLocaleString()}</span>{" "}
                  {t.uses}
                </span>
                {cmd.cooldown_seconds > 0 && (
                  <span>{cmd.cooldown_seconds}s {t.cooldown}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}