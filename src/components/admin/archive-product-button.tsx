"use client"

import { useState, useTransition } from "react"
import { archiveProduct } from "@/app/[lang]/shop/admin/products/actions"
import { useI18n } from "@/components/i18n/provider"
import { interpolate } from "@/lib/i18n/shared"
import { cn } from "@/lib/utils"

export function ArchiveProductButton({ id, name }: Readonly<{ id: string; name: string }>) {
  const { dictionary } = useI18n()
  const t = dictionary.admin.archive
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
        {t.archive}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] text-muted-foreground">{interpolate(t.confirm, { name })}</span>
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
        {isPending ? t.archiving : t.confirmButton}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={isPending}
        className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        {dictionary.common.cancel}
      </button>
    </div>
  )
}
