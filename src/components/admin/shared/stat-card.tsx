"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  icon: ReactNode
  label: string
  value: number
  valueClass?: string
}

/** Shared stat card used by all admin list components. */
export function StatCard({ icon, label, value, valueClass }: StatCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-sm border border-border bg-secondary p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <span className={cn("text-[20px] font-bold tabular-nums", valueClass ?? "text-foreground")}>
        {value}
      </span>
    </div>
  )
}
