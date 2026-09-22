"use client"

import type { ReactNode, RefObject } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

export interface OverlayNavLabels {
  close: string
  previous: string
  next: string
}

/** "sidebar" = solid size-7 buttons for desktop sidebars and admin detail
 *  drawers; "glass" = translucent size-8 buttons for the mobile sticky
 *  title bar that floats over the collapsing media header. */
const navButtonClass = {
  sidebar:
    "flex size-7 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90 disabled:opacity-40 disabled:hover:bg-secondary",
  glass:
    "flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground transition-[colors,transform] duration-150 hover:bg-background active:scale-90 disabled:opacity-40 disabled:hover:bg-background/90",
} as const

type NavVariant = keyof typeof navButtonClass

interface NavControlsProps {
  index: number
  count: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
  labels: OverlayNavLabels
  variant: NavVariant
  showCounter?: boolean
  children?: ReactNode
}

/** Close button + prev/next cluster. `children` renders between the two
 *  groups — the sticky title bar uses it for the fading title text. */
function NavControls({
  index,
  count,
  onClose,
  onNavigate,
  labels,
  variant,
  showCounter = false,
  children,
}: Readonly<NavControlsProps>) {
  const canGoPrev = index > 0
  const canGoNext = index < count - 1
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        aria-label={labels.close}
        className={navButtonClass[variant]}
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      {children}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canGoPrev && onNavigate(index - 1)}
          disabled={!canGoPrev}
          aria-label={labels.previous}
          className={navButtonClass[variant]}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        {showCounter && (
          <span className="text-[12px] tabular-nums text-muted-foreground">
            {index + 1} / {count}
          </span>
        )}
        <button
          type="button"
          onClick={() => canGoNext && onNavigate(index + 1)}
          disabled={!canGoNext}
          aria-label={labels.next}
          className={navButtonClass[variant]}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>
    </>
  )
}

/** Header row with close + prev/next controls, used by the desktop metadata
 *  sidebar and the admin detail drawers. */
export function OverlayNavHeader(
  props: Readonly<Omit<NavControlsProps, "variant" | "children">>,
) {
  return (
    <div className="flex shrink-0 items-center justify-between px-4 pb-4 pt-4 lg:px-5">
      <NavControls {...props} variant="sidebar" />
    </div>
  )
}

/** Sticky mobile title bar. A frosted-glass background and the title fade in
 *  as the media header scrolls away (driven by useCollapsingOverlayHeader), so
 *  the controls always stay reachable and readable over the image. */
export function OverlayTitleBar({
  titleRef,
  titleTextRef,
  title,
  ...navProps
}: Readonly<
  Omit<NavControlsProps, "variant" | "children" | "showCounter"> & {
    titleRef: RefObject<HTMLDivElement | null>
    titleTextRef: RefObject<HTMLDivElement | null>
    title: string
  }
>) {
  return (
    <div
      ref={titleRef}
      className="sticky top-0 z-40 flex items-center justify-between gap-2 px-4 py-3 bg-transparent transition-colors duration-200"
    >
      <NavControls {...navProps} variant="glass">
        <div
          ref={titleTextRef}
          className="min-w-0 flex-1 px-8 text-center text-[15px] font-medium text-foreground opacity-0 transition-opacity duration-200"
        >
          {title}
        </div>
      </NavControls>
    </div>
  )
}
