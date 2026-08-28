"use client"

import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface Column<T extends string> {
  key: T
  label: string
  className: string
  /** Whether this column is right-aligned (affects sort button layout). */
  alignRight?: boolean
}

interface SortHeaderProps<T extends string> {
  columns: Column<T>[]
  sortKey: T
  sortDir: "asc" | "desc"
  onSort: (key: T) => void
  /** Optional leading column (e.g. "ID" or checkbox) shown before sortable columns. */
  leadingLabel?: string
  leadingClassName?: string
  /** Optional trailing column label (e.g. "Actions") shown after sortable columns. */
  trailingLabel?: string
  trailingClassName?: string
}

/** Sortable column header row used by all admin list tables. */
export function SortHeader<T extends string>({
  columns,
  sortKey,
  sortDir,
  onSort,
  leadingLabel,
  leadingClassName = "w-8 shrink-0",
  trailingLabel,
  trailingClassName = "w-24 shrink-0 text-right",
}: SortHeaderProps<T>) {
  return (
    <div className="flex items-center gap-4 border-b border-border bg-secondary/50 px-4 py-2.5">
      {leadingLabel && (
        <span className={cn("text-[11px] font-medium uppercase tracking-wide text-muted-foreground", leadingClassName)}>
          {leadingLabel}
        </span>
      )}
      {columns.map((col) => (
        <button
          key={col.key}
          type="button"
          onClick={() => onSort(col.key)}
          className={cn(
            "flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground",
            col.className,
            col.alignRight && "justify-end",
          )}
        >
          {col.label}
          <SortIcon column={col.key} sortKey={sortKey} sortDir={sortDir} />
        </button>
      ))}
      {trailingLabel && (
        <span className={cn("text-[11px] font-medium uppercase tracking-wide text-muted-foreground", trailingClassName)}>
          {trailingLabel}
        </span>
      )}
    </div>
  )
}

function SortIcon<T extends string>({
  column,
  sortKey,
  sortDir,
}: {
  column: T
  sortKey: T
  sortDir: "asc" | "desc"
}) {
  if (sortKey !== column) return <ArrowUpDown className="size-3 opacity-40" />
  return sortDir === "asc"
    ? <ArrowUp className="size-3 text-gold-bright" />
    : <ArrowDown className="size-3 text-gold-bright" />
}
