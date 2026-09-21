"use client"

import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"
import { DATE_PRESETS } from "@/lib/admin-utils"
import type { DatePreset } from "@/lib/admin-utils"
import { useI18n } from "@/components/i18n/provider"

interface FilterPillsProps<T extends string> {
  readonly options: { value: T; label: string }[]
  readonly value: T
  readonly onChange: (value: T) => void
  /** Optional date range selector shown on the right side. */
  readonly datePreset?: DatePreset
  readonly onDateChange?: (value: DatePreset) => void
  /** ARIA label for the date selector. */
  readonly dateAriaLabel?: string
  /** Visual variant: "admin" (default) uses bg-secondary for inactive pills,
   *  "shop" uses bg-background (for use inside bg-secondary containers). */
  readonly variant?: "admin" | "shop"
}

/** Shared filter pill row used by admin and shop list components. */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  datePreset,
  onDateChange,
  dateAriaLabel,
  variant = "admin",
}: FilterPillsProps<T>) {
  const { dictionary } = useI18n()
  const shared = dictionary.adminShared
  const effectiveDateAriaLabel = dateAriaLabel ?? shared.dateRange
  const inactiveClass = variant === "shop"
    ? "bg-background text-muted-foreground hover:text-foreground"
    : "bg-secondary text-muted-foreground hover:text-foreground"

  return (
    <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "h-7 shrink-0 rounded-full px-3 text-[12px] font-medium transition-colors",
            value === opt.value
              ? "bg-gold text-gold-foreground"
              : inactiveClass,
          )}
        >
          {opt.label}
        </button>
      ))}
      {onDateChange && datePreset !== undefined && (
        <div className="ml-0 flex shrink-0 items-center gap-1.5 sm:ml-auto">
          <Calendar className="size-3.5 text-muted-foreground" />
          <select
            value={datePreset}
            onChange={(e) => onDateChange(e.target.value as DatePreset)}
            className="h-7 rounded-full border border-border bg-background px-3 text-[12px] text-foreground focus:border-gold focus:outline-none"
            aria-label={effectiveDateAriaLabel}
          >
            {DATE_PRESETS.map((opt) => (
              <option key={opt.value} value={opt.value}>{shared.datePresets[opt.value]}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
