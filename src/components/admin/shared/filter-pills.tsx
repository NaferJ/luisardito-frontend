"use client"

import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"
import { DATE_PRESETS } from "@/lib/admin-utils"
import type { DatePreset } from "@/lib/admin-utils"

interface FilterPillsProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** Optional date range selector shown on the right side. */
  datePreset?: DatePreset
  onDateChange?: (value: DatePreset) => void
  /** ARIA label for the date selector. */
  dateAriaLabel?: string
  /** Visual variant: "admin" (default) uses bg-secondary for inactive pills,
   *  "shop" uses bg-background (for use inside bg-secondary containers). */
  variant?: "admin" | "shop"
}

/** Shared filter pill row used by admin and shop list components. */
export function FilterPills<T extends string>({
  options,
  value,
  onChange,
  datePreset,
  onDateChange,
  dateAriaLabel = "Date range",
  variant = "admin",
}: FilterPillsProps<T>) {
  const inactiveClass = variant === "shop"
    ? "bg-background text-muted-foreground hover:text-foreground"
    : "bg-secondary text-muted-foreground hover:text-foreground"

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
          className={cn(
            "h-7 rounded-full px-3 text-[12px] font-medium transition-colors",
            value === opt.value
              ? "bg-gold text-gold-foreground"
              : inactiveClass,
          )}
        >
          {opt.label}
        </button>
      ))}
      {onDateChange && datePreset !== undefined && (
        <div className="ml-auto flex items-center gap-1.5">
          <Calendar className="size-3.5 text-muted-foreground" />
          <select
            value={datePreset}
            onChange={(e) => onDateChange(e.target.value as DatePreset)}
            className="h-7 rounded-full border border-border bg-background px-3 text-[12px] text-foreground focus:border-gold focus:outline-none"
            aria-label={dateAriaLabel}
          >
            {DATE_PRESETS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
