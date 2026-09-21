"use client"

import type { ReactNode } from "react"
import { OverlayNavHeader, type OverlayNavLabels } from "@/components/overlay-nav"
import { useOverlayKeyboardNav } from "@/lib/overlay-hooks"

/**
 * Shared detail-drawer shell: a static, always-opaque sidebar that sits at
 * z-50 above the page (so a backdrop can never tint it), with a close +
 * prev/next header and built-in Escape/arrow-key navigation + body scroll
 * lock. Callers supply the scrollable content and an optional footer. The
 * "slide-in" illusion is created by the list shifting right, not by the
 * panel moving — same layering as ProductDetailOverlay.
 */
export function OverlayDrawer({
  ariaLabel,
  index,
  count,
  onClose,
  onNavigate,
  labels,
  showCounter,
  footer,
  children,
}: Readonly<{
  ariaLabel: string
  index: number
  count: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
  labels: OverlayNavLabels
  showCounter?: boolean
  footer?: ReactNode
  children: ReactNode
}>) {
  useOverlayKeyboardNav(index, count, onClose, onNavigate)
  return (
    <aside
      aria-label={ariaLabel}
      className="overlay-enter fixed inset-y-0 left-0 right-0 z-50 flex flex-col overflow-hidden bg-background xl:left-[max(252px,calc(50vw-588px))] xl:right-auto xl:w-[292px]"
    >
      <OverlayNavHeader
        index={index}
        count={count}
        onClose={onClose}
        onNavigate={onNavigate}
        labels={labels}
        showCounter={showCounter}
      />
      {children}
      {footer}
    </aside>
  )
}

/** Click-outside backdrop — covers the list right of the drawer so clicks
 *  can't fall through to it. */
export function DrawerBackdrop({ onClose }: Readonly<{ onClose: () => void }>) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 xl:left-[max(252px,calc(50vw-588px)+292px)]"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}
