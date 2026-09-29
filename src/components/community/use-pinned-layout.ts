"use client"

import { useLayoutEffect, useState, type RefObject } from "react"

type Box = { top: number; bottom: number; left: number; right: number }

// Neighbouring cards overlap by exactly one border so they share a single hairline.
const SHARED_BORDER = 1

function boxOf(element: Element, origin: DOMRect): Box {
  const bounds = element.getBoundingClientRect()
  return {
    top: bounds.top - origin.top,
    bottom: bounds.bottom - origin.top,
    left: bounds.left - origin.left,
    right: bounds.right - origin.left,
  }
}

function overlaps(a: Box, b: Box) {
  return (
    a.bottom - SHARED_BORDER > b.top &&
    a.top + SHARED_BORDER < b.bottom &&
    a.right - SHARED_BORDER > b.left &&
    a.left + SHARED_BORDER < b.right
  )
}

function setWidth(card: HTMLElement, width: number | null) {
  if (width === null) {
    card.style.removeProperty("width")
    card.style.removeProperty("max-width")
    return
  }
  card.style.width = `${width}px`
  card.style.maxWidth = "none"
}

function preferredWidth(card: HTMLElement) {
  card.style.width = "max-content"
  card.style.maxWidth = "none"
  const width = Math.ceil(card.getBoundingClientRect().width)
  setWidth(card, null)
  return width
}

function isSplit(frame: HTMLElement) {
  return getComputedStyle(frame).gridTemplateColumns.trim().split(/\s+/).length > 1
}

/**
 * Lets pinned cards borrow space from the feed side when their content needs it.
 *
 * Feed cards are sized purely by CSS (content width, capped by their column).
 * A pinned card starts content-sized inside its own column; only when its
 * content is wider than that column does it grow leftwards, up to the right
 * edge of the widest feed card beside it. That limit depends on rendered
 * geometry, so it is measured from the DOM: feed cards are the children of
 * `[data-community-feed]`, pinned cards are the `article` children of the
 * aside. Returns `ready` after the first pass so the unmeasured state can be
 * hidden.
 */
export function usePinnedLayout(asideRef: RefObject<HTMLElement | null>) {
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const aside = asideRef.current
    const frame = aside?.parentElement
    const feed = frame?.querySelector<HTMLElement>("[data-community-feed]")
    if (!aside || !frame || !feed) return

    const pinned = Array.from(aside.querySelectorAll<HTMLElement>(":scope > article"))
    const feedCards = Array.from(feed.children)
    let animationFrame = 0
    let active = true

    function layout() {
      if (!aside || !frame) return
      pinned.forEach((card) => setWidth(card, null))

      if (isSplit(frame)) {
        const origin = frame.getBoundingClientRect()
        const column = aside.getBoundingClientRect()
        const right = column.right - origin.left
        const obstacles = feedCards.map((card) => boxOf(card, origin))

        for (const card of pinned) {
          const preferred = Math.min(preferredWidth(card), right)
          if (preferred <= column.width) continue

          const candidates = [preferred, ...obstacles.map((box) => Math.floor(right - box.right + SHARED_BORDER))]
            .filter((width) => width > column.width && width <= preferred)
            .sort((a, b) => b - a)
          const fits = candidates.some((width) => {
            setWidth(card, width)
            const box = boxOf(card, origin)
            return !obstacles.some((obstacle) => overlaps(obstacle, box))
          })
          if (!fits) setWidth(card, null)
        }
      }
      setReady(document.fonts.status === "loaded")
    }

    function scheduleLayout() {
      if (!active) return
      cancelAnimationFrame(animationFrame)
      animationFrame = requestAnimationFrame(layout)
    }

    const observer = new ResizeObserver(scheduleLayout)
    observer.observe(frame)
    ;[...feedCards, ...pinned].forEach((card) => observer.observe(card))
    document.fonts.addEventListener("loadingdone", scheduleLayout)
    document.fonts.ready.then(scheduleLayout)
    layout()

    return () => {
      active = false
      observer.disconnect()
      document.fonts.removeEventListener("loadingdone", scheduleLayout)
      cancelAnimationFrame(animationFrame)
      pinned.forEach((card) => setWidth(card, null))
    }
  }, [asideRef])

  return ready
}
