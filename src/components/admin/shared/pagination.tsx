"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { PAGE_SIZE_OPTIONS, type PageSize } from "@/lib/admin-utils"
import { useI18n } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"

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
  const { dictionary } = useI18n()
  const shared = dictionary.adminShared
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
      <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span>
          {interpolate(shared.rangeOf, {
            start: (currentPage - 1) * pageSize + 1,
            end: Math.min(currentPage * pageSize, totalItems),
            total: totalItems,
          })}
        </span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value) as PageSize)}
          className="h-7 rounded-sm border border-border bg-background px-2 text-[12px] text-foreground focus:border-gold focus:outline-none"
          aria-label={shared.pageSize}
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>{interpolate(shared.perPage, { n: s })}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex size-7 items-center justify-center rounded-sm border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          aria-label={shared.previousPage}
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
          aria-label={shared.nextPage}
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
