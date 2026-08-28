"use client"

import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react"
import Image from "next/image"
import { showcaseSlides, type ShowcaseSlide, type SocialLink } from "@/lib/landing-data"
import { cn } from "@/lib/utils"

const IMAGE_DELAY_MS = 200
const SLIDE_TRANSITION_MS = 500
const MUTE_COOKIE = "luisardito-showcase-muted"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReducedMotion(callback: () => void): () => void {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY)
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches
}

function getReducedMotionServerSnapshot(): boolean {
  return false
}

/** Subscribes to the prefers-reduced-motion media query (hydration-safe). */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  )
}

function SocialIcon({ label }: Readonly<{ label: string }>) {
  const className = "size-4"
  switch (label) {
    case "YouTube":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    case "Instagram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
        </svg>
      )
    case "TikTok":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      )
    case "Facebook":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    case "GitHub":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      )
    case "Twitter":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    default:
      return null
  }
}

function SocialLinks({ socials }: Readonly<{ socials: SocialLink[] }>) {
  return (
    <div className="flex items-center gap-3">
      {socials.map((social) => (
        <a
          key={social.label}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.label}
          className="flex size-8 items-center justify-center rounded-full bg-background text-muted-foreground transition-colors hover:text-foreground"
        >
          <SocialIcon label={social.label} />
        </a>
      ))}
    </div>
  )
}

/** Player: thin progress dots (one per slide) + standalone circular pause/mute buttons */
function ShowcaseControls({
  slides,
  currentSlide,
  slideDurations,
  isPlaying,
  isMuted,
  onSlideChange,
  onTogglePlay,
  onToggleMute,
}: Readonly<{
  slides: ShowcaseSlide[]
  currentSlide: number
  slideDurations: number[]
  isPlaying: boolean
  isMuted: boolean
  onSlideChange: (index: number) => void
  onTogglePlay: () => void
  onToggleMute: () => void
}>) {
  return (
    <div className="flex items-center gap-3" aria-label="Showcase controls">
      {/* Progress dots — one thin bar per slide, fills left to right */}
      <div className="flex flex-1 items-center gap-1.5" aria-label="Choose slide">
        {slides.map((s, i) => (
          <button
            key={s.channelId}
            type="button"
            onClick={() => onSlideChange(i)}
            disabled={i === currentSlide}
            aria-label={`Show ${s.name}`}
            aria-current={i === currentSlide}
            className={cn(
              "progress-dot h-1 flex-1 rounded-full",
              i === currentSlide && "active",
              i < currentSlide && "completed",
              !isPlaying && i === currentSlide && "paused",
            )}
            style={{
              ["--slide-duration" as string]: `${slideDurations[i] ?? 10000}ms`,
            }}
          >
            <span className="progress-fill" />
          </button>
        ))}
      </div>

      {/* Pause/Play — standalone circular button */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={!isPlaying}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M9 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
            <path d="M17 4h-2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Mute/Unmute — standalone circular button */}
      <button
        type="button"
        onClick={onToggleMute}
        aria-label={isMuted ? "Unmute" : "Mute"}
        className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-secondary"
      >
        {isMuted ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>
    </div>
  )
}

/** Horizontal slide: compact text block + video on right (only video animates) */
function HorizontalSlide({
  slide,
  phase,
  videoRef,
  controls,
}: Readonly<{
  slide: ShowcaseSlide
  phase: "image" | "expanded"
  videoRef: React.RefObject<HTMLVideoElement | null>
  controls: React.ReactNode
}>) {
  const expanded = phase === "expanded"

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
      {/* Left: text block (static, no animation) */}
      <div className="flex shrink-0 self-center flex-col gap-3 sm:w-[35%] sm:justify-center">
        {/* Controls — at the top */}
        {controls}

        {/* Image + text row */}
        <div className="flex items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:size-24">
            <Image
              src={`/landing/channels/${slide.channelId}.jpg`}
              alt={slide.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-[15px] font-semibold text-foreground">{slide.name}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{slide.description}</p>
            <SocialLinks socials={slide.socials} />
          </div>
        </div>
      </div>

      {/* Right: video with ambient glow — only this animates, fills remaining row width */}
      <div className="flex flex-1 items-center justify-center">
        <div
          className={cn(
            "relative w-[560px] transition-all duration-500 ease-out",
            expanded ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
          )}
        >
        {/* Ambient glow: blurred video bleeding out behind */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-1 -inset-y-2 scale-[1.02] blur-xl"
        >
          {slide.video && (
            <video
              src={slide.video}
              className="absolute inset-0 size-full object-cover opacity-60"
              playsInline
              loop
              muted
              aria-hidden="true"
              tabIndex={-1}
            />
          )}
        </div>
        {/* The actual video, sharp and on top */}
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-secondary">
          {slide.video && (
            <video
              ref={videoRef}
              src={slide.video}
              className="absolute inset-0 size-full object-cover"
              playsInline
              loop
            />
          )}
        </div>
        </div>
      </div>
    </div>
  )
}

/** Vertical slide: image+text+socials at top, videos appear one by one */
function VerticalSlide({
  slide,
  activeVideoIndex,
  videoRefs,
  controls,
}: Readonly<{
  slide: ShowcaseSlide
  activeVideoIndex: number
  videoRefs: React.RefObject<(HTMLVideoElement | null)[]>
  controls: React.ReactNode
}>) {
  const videos = slide.verticalVideos ?? []

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
      {/* Left: text block (same layout as horizontal slides) */}
      <div className="flex shrink-0 self-center flex-col gap-3 sm:w-[35%] sm:justify-center">
        {/* Controls — at the top */}
        {controls}

        {/* Image + text row */}
        <div className="flex items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-secondary sm:size-24">
            <Image
              src={`/landing/channels/${slide.channelId}.jpg`}
              alt={slide.name}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
          <div className="flex min-w-0 flex-col gap-2">
            <h3 className="text-[15px] font-semibold text-foreground">{slide.name}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{slide.description}</p>
            <SocialLinks socials={slide.socials} />
          </div>
        </div>
      </div>

      {/* Right: vertical videos — same position as horizontal video */}
      <div className="flex flex-1 items-center justify-center">
        <div className="flex w-full flex-wrap items-center justify-center gap-3 sm:w-[560px] sm:flex-nowrap">
          {videos.map((video, i) => {
          const isVisible = i <= activeVideoIndex
          const isActive = i === activeVideoIndex
          return (
            <div
              key={video}
              className={cn(
                "relative transition-all duration-500 ease-out",
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none",
              )}
            >
              {/* Ambient glow: blurred video bleeding out behind */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-1 -inset-y-2 scale-[1.02] blur-xl"
              >
                <video
                  src={video}
                  className="aspect-[9/16] w-36 object-cover opacity-60 sm:w-44"
                  playsInline
                  loop
                  muted
                  aria-hidden="true"
                  tabIndex={-1}
                />
              </div>
              {/* The actual video, sharp and on top */}
              <div className="relative aspect-[9/16] w-36 overflow-hidden rounded-2xl bg-secondary sm:w-44">
                <video
                  ref={(el) => {
                    if (videoRefs.current) videoRefs.current[i] = el
                  }}
                  src={video}
                  className="size-full object-cover"
                  playsInline
                  loop
                  aria-label={`${slide.name} video ${i + 1}`}
                />
                {/* Pause overlay for inactive videos */}
                {!isActive && isVisible && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/30">
                    <span className="flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
        </div>
      </div>
    </div>
  )
}

/** Text-only slide (NaferJ developer easter egg) */
/** Read cookie value */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Set cookie value (1 year expiry) */
function setCookie(name: string, value: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=31536000;samesite=lax`
}

export function LandingShowcase() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [phase, setPhase] = useState<"image" | "expanded">("image")
  const [activeVideoIndex, setActiveVideoIndex] = useState(0)
  const reducedMotion = usePrefersReducedMotion()

  // Global player state
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(true)

  const horizontalVideoRef = useRef<HTMLVideoElement | null>(null)
  const verticalVideoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const isMutedRef = useRef(true) // ref mirror for use in timers
  const isPlayingRef = useRef(true) // ref mirror for use in timers
  const activeVideoIndexRef = useRef(0) // ref mirror for use in togglePlay
  const isVerticalRef = useRef(false) // ref mirror for use in togglePlay

  const slide = showcaseSlides[currentSlide]
  const isVertical = !!slide.verticalVideos

  // Load mute preference from cookie on mount.
  // Reading the cookie during render would cause a hydration mismatch (the
  // cookie only exists on the client), so this must happen in an effect.
  useEffect(() => {
    const saved = getCookie(MUTE_COOKIE)
    if (saved !== null) {
      const muted = saved === "true"
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only init from cookie
      setIsMuted(muted)
      isMutedRef.current = muted
    }
  }, [])

  // Sync muted state to all video elements via refs
  const applyMuted = useCallback((muted: boolean) => {
    if (horizontalVideoRef.current) horizontalVideoRef.current.muted = muted
    verticalVideoRefs.current.forEach((v) => {
      if (v) v.muted = muted
    })
  }, [])

  useEffect(() => {
    isMutedRef.current = isMuted
    applyMuted(isMuted)
  }, [isMuted, applyMuted])

  // Sync isPlaying to ref
  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // Sync activeVideoIndex to ref
  useEffect(() => {
    activeVideoIndexRef.current = activeVideoIndex
  }, [activeVideoIndex])

  // Sync isVertical to ref
  useEffect(() => {
    isVerticalRef.current = isVertical
  }, [isVertical])

  // Global play/pause — pauses all, resumes only the active video
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const next = !prev
      isPlayingRef.current = next
      if (next) {
        // Resume only the currently active video
        if (isVerticalRef.current) {
          const v = verticalVideoRefs.current[activeVideoIndexRef.current]
          if (v) v.play().catch(() => {})
        } else if (horizontalVideoRef.current) {
          horizontalVideoRef.current.play().catch(() => {})
        }
      } else {
        // Pause all videos
        horizontalVideoRef.current?.pause()
        verticalVideoRefs.current.forEach((v) => v?.pause())
      }
      return next
    })
  }, [])

  // Global mute/unmute — saved to cookie
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev
      setCookie(MUTE_COOKIE, String(next))
      return next
    })
  }, [])

  // Reset state when slide changes
  const resetSlide = useCallback(() => {
    setPhase("image")
    setActiveVideoIndex(0)
    verticalVideoRefs.current.forEach((v) => {
      if (v) {
        v.pause()
        v.currentTime = 0
        v.muted = isMutedRef.current
      }
    })
    if (horizontalVideoRef.current) {
      horizontalVideoRef.current.pause()
      horizontalVideoRef.current.currentTime = 0
      horizontalVideoRef.current.muted = isMutedRef.current
    }
  }, [])

  // Main timing sequence for each slide — only restarts on slide change, NOT on play/pause.
  // resetSlide coordinates state resets with video-element side effects, so it must run here.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- coordinated state + video reset on slide change
    resetSlide()
    const timers: ReturnType<typeof setTimeout>[] = []

    // Helper: check if paused before advancing slide
    const advanceSlide = () => {
      if (!isPlayingRef.current) {
        // Paused — try again in 500ms
        timers.push(setTimeout(advanceSlide, 500))
        return
      }
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length)
    }

    if (reducedMotion) {
      setPhase("expanded")
      if (isVertical) {
        setActiveVideoIndex((slide.verticalVideos?.length ?? 1) - 1)
        verticalVideoRefs.current.forEach((v) => {
          if (v) {
            v.muted = isMutedRef.current
            if (isPlayingRef.current) v.play().catch(() => {})
          }
        })
      } else {
        if (horizontalVideoRef.current) {
          horizontalVideoRef.current.muted = isMutedRef.current
          if (isPlayingRef.current) horizontalVideoRef.current.play().catch(() => {})
        }
      }
      const slideDuration = isVertical
        ? (slide.verticalVideos?.reduce((sum, _v, i) => sum + (i === 0 ? 7000 : i === 1 ? 12000 : 16000), 0) ?? 10000)
        : 15000
      timers.push(setTimeout(advanceSlide, slideDuration))
      return () => timers.forEach(clearTimeout)
    }

    if (isVertical) {
      const durations = [7000, 12000, 16000]
      const videos = slide.verticalVideos ?? []

      setPhase("expanded")

      // Helper to advance to next vertical video
      const advanceVerticalVideo = (i: number) => {
        if (!isPlayingRef.current) {
          timers.push(setTimeout(() => advanceVerticalVideo(i), 500))
          return
        }
        verticalVideoRefs.current[i - 1]?.pause()
        setActiveVideoIndex(i)
        activeVideoIndexRef.current = i
        const v = verticalVideoRefs.current[i]
        if (v) {
          v.muted = isMutedRef.current
          v.play().catch(() => {})
        }
      }

      videos.forEach((_, i) => {
        if (i === 0) {
          const startFirstVideo = () => {
            if (!isPlayingRef.current) {
              timers.push(setTimeout(startFirstVideo, 500))
              return
            }
            setActiveVideoIndex(0)
            activeVideoIndexRef.current = 0
            const v = verticalVideoRefs.current[0]
            if (v) {
              v.muted = isMutedRef.current
              v.play().catch(() => {})
            }
          }
          timers.push(setTimeout(startFirstVideo, 100))
        } else {
          const delay = durations.slice(0, i).reduce((sum, d) => sum + d, 0)
          timers.push(setTimeout(() => advanceVerticalVideo(i), delay))
        }
      })

      const totalDuration = durations.slice(0, videos.length).reduce((sum, d) => sum + d, 0)
      timers.push(setTimeout(advanceSlide, totalDuration + SLIDE_TRANSITION_MS))
    } else {
      timers.push(
        setTimeout(() => {
          setPhase("expanded")
          setTimeout(() => {
            const v = horizontalVideoRef.current
            if (v) {
              v.muted = isMutedRef.current
              if (isPlayingRef.current) v.play().catch(() => {})
            }
          }, 700)
        }, IMAGE_DELAY_MS),
      )

      const videoDuration = slide.channelId === "luisardito" ? 24700 : 20900
      timers.push(setTimeout(advanceSlide, IMAGE_DELAY_MS + videoDuration + SLIDE_TRANSITION_MS))
    }

    return () => timers.forEach(clearTimeout)
  }, [currentSlide, reducedMotion, isVertical, slide, resetSlide])

  // Compute total duration for each slide (for progress dot fill animation)
  const slideDurations = showcaseSlides.map((s) => {
    if (s.verticalVideos) {
      // Vertical: sum of video durations (7s + 12s + 16s)
      return 7000 + 12000 + 16000 + SLIDE_TRANSITION_MS
    }
    // Horizontal: image delay + video duration
    const videoDuration = s.channelId === "luisardito" ? 24700 : 20900
    return IMAGE_DELAY_MS + videoDuration + SLIDE_TRANSITION_MS
  })

  // Build the controls element once, pass into slides
  const controls = (
    <ShowcaseControls
      slides={showcaseSlides}
      currentSlide={currentSlide}
      slideDurations={slideDurations}
      isPlaying={isPlaying}
      isMuted={isMuted}
      onSlideChange={setCurrentSlide}
      onTogglePlay={togglePlay}
      onToggleMute={toggleMute}
    />
  )

  return (
    <section id="showcase" className="flex flex-col gap-4 pt-8 pb-0">
      {/* Slide content — fixed min-height prevents section from jumping between slides */}
      <div key={currentSlide} className="min-h-[380px]">
        {isVertical ? (
          <VerticalSlide
            slide={slide}
            activeVideoIndex={activeVideoIndex}
            videoRefs={verticalVideoRefs}
            controls={controls}
          />
        ) : (
          <HorizontalSlide
            slide={slide}
            phase={phase}
            videoRef={horizontalVideoRef}
            controls={controls}
          />
        )}
      </div>
    </section>
  )
}
