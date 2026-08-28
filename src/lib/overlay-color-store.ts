"use client"

import { useSyncExternalStore } from "react"

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
  if (colors?.length === currentColors?.length) {
    let same = true
    for (let i = 0; i < colors.length; i++) {
      if (colors[i] !== currentColors[i]) {
        same = false
        break
      }
    }
    if (same) return
  }
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
