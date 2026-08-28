"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/admin-utils"

interface PaginationProps {
  readonly currentPage: number
  readonly totalPages: number
  readonly pageSize: PageSize
  readonly totalItems: number
  readonly onPageChange: (page: number) => void
  readonly onPageSizeChange: (size: PageSize) => void
}

/** Shared pagination control used by all admin list components. */
export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>
          {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          className="h-7 rounded-sm border border-border bg-background px-2 text-[12px] text-foreground focus:border-gold focus:outline-none"
          aria-label="Page size"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}/page</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="px-2 text-[12px] tabular-nums text-foreground">
          {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          aria-label="Next page"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
