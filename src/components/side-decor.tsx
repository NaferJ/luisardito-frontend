"use client"

import { useEffect, useState } from "react"
import { Dithering } from "@paper-design/shaders-react"

type SideDecorProps = {
  side: "left" | "right"
}

export function SideDecor({ side }: SideDecorProps) {
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
  const colorFront = isDark ? "#D49A22" : "#8F5E0A"

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
        colorFront={colorFront}
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
