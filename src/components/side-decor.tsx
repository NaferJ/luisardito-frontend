"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Dithering } from "@paper-design/shaders-react"
import { useOverlayColors } from "@/lib/overlay-color-store"

type SideDecorProps = {
  readonly side: "left" | "right"
}

/** Parse a #RRGGBB hex string into [r, g, b]. */
function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Convert [r, g, b] back to a #RRGGBB hex string. */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Ease-in-out for a natural-feeling transition. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Perceptual luminance (0-1) for an [r, g, b] triple. */
function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** Convert [r, g, b] (0-255) to HSL where h is in degrees, s and l are 0-1. */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  let h = 0
  let s = 0
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rn:
        h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60
        break
      case gn:
        h = ((bn - rn) / d + 2) * 60
        break
      default:
        h = ((rn - gn) / d + 4) * 60
    }
  }
  return [h, s, l]
}

/** Convert HSL back to [r, g, b] (0-255). */
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255)
    return [v, v, v]
  }
  const hue = (h % 360) / 360
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  const toRgb = (t: number) => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }
  return [
    Math.round(toRgb(hue + 1 / 3) * 255),
    Math.round(toRgb(hue) * 255),
    Math.round(toRgb(hue - 1 / 3) * 255),
  ]
}

/**
 * Take the most dominant color from the image and, if it's too close to the
 * background in luminance, shift its lightness (preserving hue and saturation)
 * just enough to clear a minimum contrast threshold.
 *
 * This keeps the original product color visible rather than swapping it for a
 * different candidate. In dark mode a too-dark color is lightened; in light
 * mode a too-light color is darkened. If the color already reads well, it is
 * returned unchanged.
 */
const MIN_CONTRAST = 0.2
function ensureContrast(color: string, background: string, isDark: boolean): string {
  const [r, g, b] = hexToRgb(color)
  const backLum = luminance(...hexToRgb(background))
  const colorLum = luminance(r, g, b)
  if (Math.abs(colorLum - backLum) >= MIN_CONTRAST) return color

  const [h, s, l] = rgbToHsl(r, g, b)
  // Push lightness away from the background: lighten in dark mode, darken in
  // light mode. Step in 5% increments until contrast clears the threshold.
  let newL = l
  for (let i = 0; i < 20; i++) {
    newL = isDark ? Math.min(1, newL + 0.05) : Math.max(0, newL - 0.05)
    const [nr, ng, nb] = hslToRgb(h, s, newL)
    if (Math.abs(luminance(nr, ng, nb) - backLum) >= MIN_CONTRAST) {
      return rgbToHex(nr, ng, nb)
    }
  }
  // Could not reach threshold — return the most-shifted version we found.
  const [nr, ng, nb] = hslToRgb(h, s, newL)
  return rgbToHex(nr, ng, nb)
}

const TRANSITION_MS = 1200

export function SideDecor({ side }: SideDecorProps) {
  const pathname = usePathname()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const checkDark = () => {
      const html = document.documentElement
      if (html.classList.contains("dark")) return true
      if (html.classList.contains("light")) return false
      return window.matchMedia("(prefers-color-scheme: dark)").matches
    }

    const update = () => {
      setIsDark(checkDark())
      setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setMounted(true)
    }
    update()

    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    mediaQuery.addEventListener("change", update)

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    motionQuery.addEventListener("change", update)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", update)
      motionQuery.removeEventListener("change", update)
    }
  }, [])

  const colorBack = isDark ? "#0D0D0D" : "#D9D9D9"
  // Green palette only on the landing page; gold everywhere else.
  // When a product/design overlay is open and has published dominant image
  // colors, the most dominant color becomes the shader's front color. If that
  // color is too close to the background in luminance (e.g. a dark product
  // image in dark mode), its lightness is shifted — preserving hue and
  // saturation — just enough to stay visible. The original product color is
  // kept rather than swapped for a different candidate.
  const overlayColors = useOverlayColors()
  const isLanding = pathname === "/"
  const defaultColor = isLanding
    ? isDark
      ? "#588C23"
      : "#05401A"
    : isDark
      ? "#D49A22"
      : "#8F5E0A"
  const overlayColor =
    overlayColors && overlayColors.length > 0
      ? ensureContrast(overlayColors[0], colorBack, isDark)
      : null
  const targetColor = overlayColor ?? defaultColor

  // Smoothly animate colorFront toward the target whenever it changes
  const [displayColor, setDisplayColor] = useState(targetColor)
  const currentColorRef = useRef(targetColor) // tracks the live animated color across frames
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Skip animation on first mount or when reduced motion is preferred
    if (!mounted || reducedMotion) {
      currentColorRef.current = targetColor
      // eslint-disable-next-line react-hooks/set-state-in-effect -- snap to target when animation is disabled
      setDisplayColor(targetColor)
      return
    }

    const fromRgb = hexToRgb(currentColorRef.current)
    const toRgb = hexToRgb(targetColor)
    const start = performance.now()

    const tick = (now: number) => {
      const elapsed = now - start
      const t = Math.min(elapsed / TRANSITION_MS, 1)
      const eased = easeInOutCubic(t)
      const next = rgbToHex(
        fromRgb[0] + (toRgb[0] - fromRgb[0]) * eased,
        fromRgb[1] + (toRgb[1] - fromRgb[1]) * eased,
        fromRgb[2] + (toRgb[2] - fromRgb[2]) * eased,
      )
      currentColorRef.current = next
      setDisplayColor(next)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      // currentColorRef holds the live animated value — no stale closure problem
    }
  }, [targetColor, mounted, reducedMotion])

  // Offset the right side's animation phase so the two sides are out of sync
  const frameOffset = side === "right" ? 5000 : 0

  return (
    <div
      aria-hidden="true"
      // Widths below `lg` are capped at the page's own edge padding (`p-4`
      // = 16px in `site-shell.tsx`) so the decoration never creeps into
      // actual page content on mobile/tablet — it only fills the margin
      // that's already there, just like the full 120px strip does at `lg`.
      className="pointer-events-none fixed inset-y-0 z-[15] block w-1.5 overflow-hidden sm:w-2 md:w-4 lg:w-[120px]"
      style={{
        ...(side === "left" ? { left: 0 } : { right: 0 }),
        backgroundColor: colorBack,
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.6s ease-in-out",
      }}
    >
      <Dithering
        width="100%"
        height="100%"
        colorBack={colorBack}
        colorFront={displayColor}
        shape="wave"
        type="4x4"
        size={2}
        speed={reducedMotion ? 0 : 0.5}
        frame={frameOffset}
        scale={0.8}
        rotation={90}
        fit="cover"
        style={side === "right" ? { transform: "scaleX(-1)" } : undefined}
      />

      {/* Inner edge fade — blends into content area */}
      <div
        className="absolute inset-y-0 w-[70%]"
        style={
          side === "left"
            ? {
                right: 0,
                background: `linear-gradient(to right, transparent, ${colorBack} 95%)`,
              }
            : {
                left: 0,
                background: `linear-gradient(to left, transparent, ${colorBack} 95%)`,
              }
        }
      />

      {/* Outer edge fade — softens the screen edge */}
      <div
        className="absolute inset-y-0 w-[25%]"
        style={
          side === "left"
            ? {
                left: 0,
                background: `linear-gradient(to right, ${colorBack}, transparent)`,
              }
            : {
                right: 0,
                background: `linear-gradient(to left, ${colorBack}, transparent)`,
              }
        }
      />
    </div>
  )
}
