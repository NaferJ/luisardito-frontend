"use client"

import { useEffect, useRef } from "react"
import { lockBodyScroll } from "@/lib/scroll-lock"

/** Keyboard navigation (Escape to close, ← → to move between items) plus a
 *  body scroll lock, shared by every overlay and detail drawer that pages
 *  through a list. */
export function useOverlayKeyboardNav(
  index: number,
  count: number,
  onClose: () => void,
  onNavigate: (nextIndex: number) => void,
) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1)
      if (e.key === "ArrowRight" && index < count - 1) onNavigate(index + 1)
    }
    document.addEventListener("keydown", handleKey)
    const unlock = lockBodyScroll()
    return () => {
      document.removeEventListener("keydown", handleKey)
      unlock()
    }
  }, [index, count, onClose, onNavigate])
}

/**
 * Scroll-driven collapsing media header + sticky title-bar fade used by the
 * mobile overlay layouts (product detail, leaderboard profile). The header
 * shrinks as the overlay scrolls; the title bar's background and title text
 * fade in once the header has mostly scrolled away. The effect re-runs when
 * `resetKey` (the id of the displayed item) changes, resetting the scroll
 * position and header height.
 */
export function useCollapsingOverlayHeader(resetKey: unknown) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const titleTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const header = headerRef.current
    const title = titleRef.current
    const titleText = titleTextRef.current
    if (!overlay || !header || !title || !titleText) return

    let raf = 0
    let initialHeaderHeight = 0

    const update = () => {
      raf = 0
      const scrollY = overlay.scrollTop
      const titleThreshold = Math.max(0, initialHeaderHeight - 80)

      const newHeight = Math.max(80, initialHeaderHeight - scrollY * 0.6)
      header.style.height = `${newHeight}px`
      header.style.minHeight = "0px"

      const titleProgress = Math.min(1, Math.max(0, (scrollY - titleThreshold) / 80))

      title.classList.toggle("bg-background/95", titleProgress > 0.01)
      title.classList.toggle("backdrop-blur-sm", titleProgress > 0.01)
      titleText.style.opacity = String(titleProgress)
    }

    const onScroll = () => {
      if (raf === 0) {
        raf = requestAnimationFrame(update)
      }
    }

    const reset = () => {
      overlay.scrollTop = 0
      header.style.height = ""
      header.style.minHeight = ""
      initialHeaderHeight = header.clientHeight
      header.style.height = `${initialHeaderHeight}px`
      header.style.minHeight = "0px"
      titleText.style.opacity = "0"
      title.classList.remove("bg-background/95", "backdrop-blur-sm")
    }

    reset()
    overlay.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => {
      overlay.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [resetKey])

  return { overlayRef, headerRef, titleRef, titleTextRef }
}
