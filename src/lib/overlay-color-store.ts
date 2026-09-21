"use client"

import { useEffect, useSyncExternalStore } from "react"
import { extractDominantColors } from "@/lib/extract-color"

/**
 * Tiny external store for the dominant colors of the currently-open overlay's
 * image. The overlay publishes candidate colors when it opens and clears them
 * on close; `SideDecor` subscribes and picks the candidate with the best
 * contrast against the current background, using it as the shader's
 * `colorFront` instead of the default gold/green.
 *
 * No React context provider is needed — this is a module-level singleton,
 * safe because there is only ever one overlay open at a time.
 */

let currentColors: string[] | null = null
const listeners = new Set<() => void>()

export function setOverlayColors(colors: string[] | null): void {
  // Compare by reference + length to avoid spurious notifications.
  if (colors === currentColors) return
  if (colors?.length === currentColors?.length && colors?.every((color, index) => color === currentColors?.[index])) return
  currentColors = colors
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): string[] | null {
  return currentColors
}

export function useOverlayColors(): string[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

/**
 * Publish the dominant colors for the currently-open overlay image. Stale
 * extraction results are ignored during overlay navigation, and the store is
 * cleared when the overlay unmounts or the image disappears.
 */
export function useOverlayImageColors(imageSrc: string | null): void {
  useEffect(() => {
    if (!imageSrc) {
      setOverlayColors(null)
      return
    }

    let cancelled = false
    extractDominantColors(imageSrc).then((colors) => {
      if (!cancelled) setOverlayColors(colors.length > 0 ? colors : null)
    })
    return () => {
      cancelled = true
    }
  }, [imageSrc])

  useEffect(() => {
    return () => setOverlayColors(null)
  }, [])
}
