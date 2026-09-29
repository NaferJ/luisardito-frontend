"use client"

import { useRef } from "react"
import { Pin } from "lucide-react"
import type { Dictionary } from "@/lib/i18n/shared"
import { CommunityPostCard } from "@/components/community/post-card"
import { usePinnedLayout } from "./use-pinned-layout"
import { MOCK_PINNED } from "./mock-data"

export function CommunityAside({ community }: Readonly<{ community: Dictionary["community"] }>) {
  const asideRef = useRef<HTMLElement>(null)
  const ready = usePinnedLayout(asideRef)

  return (
    <aside
      ref={asideRef}
      data-ready={ready || undefined}
      className="relative -mt-px flex min-w-0 flex-col items-end opacity-0 transition-opacity duration-200 data-[ready]:opacity-100 @min-[68rem]:mt-0 @min-[68rem]:-ml-px [&>*+*]:-mt-px"
    >
      <div className="flex w-full flex-col border border-border bg-background p-7">
        <div className="min-h-12 flex-1" />
        <div className="mt-3 flex items-center justify-end border-t border-border/60 pt-3">
          <span className="flex h-8 items-center gap-1.5 text-lg font-medium text-muted-foreground">
            <Pin className="size-[22px] text-gold-bright" />
            {community.pinnedTitle}
          </span>
        </div>
      </div>
      {MOCK_PINNED.map((item) => (
        <CommunityPostCard key={item.id} post={item} />
      ))}
    </aside>
  )
}
