"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { Dithering } from "@paper-design/shaders-react"

type SideDecorProps = {
  side: "left" | "right"
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
  // Green palette only on the landing page; gold everywhere else
  const isLanding = pathname === "/"
  const targetColor = isLanding
    ? isDark
      ? "#588C23"
      : "#05401A"
    : isDark
      ? "#D49A22"
      : "#8F5E0A"

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
      className="pointer-events-none fixed inset-y-0 z-0 hidden w-[120px] overflow-hidden lg:block"
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
