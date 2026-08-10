"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { categoryFilters } from "@/lib/nav-data"
import { cn } from "@/lib/utils"

export function FilterPills() {
  const [active, setActive] = useState<string>("All")

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-wrap gap-2">
        {categoryFilters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActive(filter)}
            aria-pressed={active === filter}
            className={cn(
              "h-8 rounded-full px-3.5 text-[13px] font-medium transition-colors",
              active === filter
                ? "bg-signal text-signal-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {filter}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="hidden shrink-0 items-center gap-1 rounded-full border border-border px-3 h-8 text-[13px] font-medium text-foreground sm:flex"
      >
        Recent
        <ChevronDown className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
