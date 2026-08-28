"use client"

import { useState, useTransition } from "react"
import { archiveProduct } from "@/app/shop/admin/products/actions"
import { cn } from "@/lib/utils"

export function ArchiveProductButton({ id, name }: Readonly<{ id: string; name: string }>) {
  const [isPending, startTransition] = useTransition()
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        disabled={isPending}
        className="text-[13px] text-muted-foreground transition-colors hover:text-destructive"
      >
        Archive
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-muted-foreground">Archive {name}?</span>
      <button
        type="button"
        onClick={() => {
          startTransition(async () => {
            try {
              await archiveProduct(id)
            } catch {
              setConfirming(false)
            }
          })
        }}
        disabled={isPending}
        className={cn(
          "text-[13px] font-medium text-destructive transition-opacity hover:opacity-70 disabled:opacity-50",
        )}
      >
        {isPending ? "Archiving..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Cancel
      </button>
    </div>
  )
}
