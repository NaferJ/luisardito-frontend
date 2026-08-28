"use client"

import { Search, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  /** Width classes for the input (e.g. "w-52 focus:w-64"). */
  widthClassName?: string
}

/** Shared search input with icon used by all admin list headers. */
export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  widthClassName = "w-52 focus:w-64",
}: SearchInputProps) {
  return (
    <div className="relative flex h-8 items-center">
      <Search className="pointer-events-none absolute left-3 size-3.5 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn(
          "h-8 rounded-full border border-border bg-secondary pl-8 pr-3 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-gold focus:outline-none transition-all",
          widthClassName,
        )}
      />
    </div>
  )
}

interface CsvButtonProps {
  onClick: () => void
}

/** Shared CSV export button used by all admin list headers. */
export function CsvButton({ onClick }: CsvButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
      aria-label="Export CSV"
      title="Export filtered results as CSV"
    >
      <Download className="size-3.5" />
      <span className="hidden sm:inline">CSV</span>
    </button>
  )
}
