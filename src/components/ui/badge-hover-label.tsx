"use client"

import type { ReactNode } from "react"
import { Tooltip } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

export function BadgeHoverLabel({
  label,
  children,
  className,
}: Readonly<{
  label: string
  children: ReactNode
  className?: string
}>) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={<span className={cn("inline-flex shrink-0 cursor-help rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-gold", className)} />}
        aria-label={label}
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner sideOffset={8} className="z-[100]">
          <Tooltip.Popup className="rounded-sm border border-gold/30 bg-popover px-2.5 py-1.5 text-[11px] font-medium text-popover-foreground shadow-lg transition-[opacity,transform] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
