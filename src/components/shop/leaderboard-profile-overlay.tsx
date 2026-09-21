"use client"

import { useEffect, useRef, type RefObject } from "react"
import { SubscriberBadge } from "@/components/subscriber-badge"
import { VipBadge } from "@/components/vip-badge"
import type { LeaderboardEntry } from "@/lib/leaderboard"
import { cn, formatCompactNumber, safeImageUrl } from "@/lib/utils"
import { lockBodyScroll } from "@/lib/scroll-lock"
import { useOverlayImageColors } from "@/lib/overlay-color-store"
import { useI18n } from "@/components/i18n/provider"
import { interpolate, type Dictionary } from "@/lib/i18n/shared"
import { OverlayNavHeader, OverlayTitleBar } from "@/components/overlay-nav"
import { useCollapsingOverlayHeader } from "@/lib/overlay-hooks"

type LeaderboardDict = Dictionary["leaderboard"]

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

function entryName(entry: LeaderboardEntry, t: LeaderboardDict): string {
  return entry.kick_data?.username ?? entry.display_name ?? entry.nickname ?? t.anonymous
}

function entryAvatar(entry: LeaderboardEntry): string | undefined {
  return safeImageUrl(entry.kick_data?.avatar_url)
}

function formatWatchtime(minutes?: number): string {
  if (!minutes || minutes <= 0) return "0m"
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes % 60}m`
  return `${minutes}m`
}

function movementText(entry: LeaderboardEntry, t: LeaderboardDict): string {
  if (entry.change_indicator === "new") return t.movement.new
  if (entry.change_indicator === "neutral") return t.movement.none
  const direction = entry.change_indicator === "up" ? t.movement.up : t.movement.down
  const unit = entry.position_change === 1 ? t.movement.place : t.movement.places
  return `${direction} ${entry.position_change} ${unit}`
}

/** Desktop lightbox avatar — same card treatment as the product image
 *  (bg-card + ring + shadow) so it reads as a framed image instead of
 *  floating bare on the blurred backdrop. */
function ProfileImage({
  name,
  avatar,
}: Readonly<{
  name: string
  avatar?: string
}>) {
  return (
    <div className="overlay-media pointer-events-auto relative flex aspect-square w-full max-w-64 items-center justify-center overflow-hidden rounded-sm bg-card shadow-2xl ring-1 ring-border">
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatar} alt={name} className="size-full object-contain" />
      ) : (
        <span className="text-7xl font-semibold text-foreground">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  )
}

/** Mobile avatar header — mirrors MobileImageHeader: the avatar sits in a
 *  card whose height shrinks as the user scrolls, so the image and its
 *  container move together. Avatars are square, so the card is too. */
function MobileAvatarHeader({
  name,
  avatar,
  headerRef,
}: Readonly<{
  name: string
  avatar?: string
  headerRef: RefObject<HTMLDivElement | null>
}>) {
  return (
    <div
      ref={headerRef}
      className="relative z-0 flex h-[40vh] min-h-[240px] max-h-[340px] items-center justify-center overflow-hidden px-6 py-4"
    >
      <div className="overlay-media relative aspect-square h-44 overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border/50">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt={name} className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-7xl font-semibold text-foreground">
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  )
}

export function LeaderboardProfileOverlay({
  entries,
  index,
  onClose,
  onNavigate,
}: Readonly<{
  entries: LeaderboardEntry[]
  index: number
  onClose: () => void
  onNavigate: (nextIndex: number) => void
}>) {
  const { dictionary } = useI18n()
  const t = dictionary.leaderboard
  const panelRef = useRef<HTMLDialogElement>(null)
  const indexRef = useRef(index)
  const entriesLengthRef = useRef(entries.length)
  const onCloseRef = useRef(onClose)
  const onNavigateRef = useRef(onNavigate)
  const entry = entries[index]
  const avatar = entry ? entryAvatar(entry) : undefined
  useOverlayImageColors(avatar ?? null)

  // Scroll-driven avatar-header shrink + sticky title bar fade — the same
  // effect ProductDetailOverlay uses on mobile, so both overlays feel identical.
  const { overlayRef, headerRef, titleRef, titleTextRef } = useCollapsingOverlayHeader(entry?.usuario_id)

  useEffect(() => {
    indexRef.current = index
    entriesLengthRef.current = entries.length
    onCloseRef.current = onClose
    onNavigateRef.current = onNavigate
  }, [entries.length, index, onClose, onNavigate])

  useEffect(() => lockBodyScroll(), [])

  useEffect(() => {
    const restoreFocusTo = document.activeElement as HTMLElement | null
    panelRef.current?.focus()
    return () => restoreFocusTo?.focus()
  }, [])

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const currentIndex = indexRef.current
      if (event.key === "Escape") {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key === "ArrowLeft" && currentIndex > 0) {
        event.preventDefault()
        onNavigateRef.current(currentIndex - 1)
        return
      }
      if (event.key === "ArrowRight" && currentIndex < entriesLengthRef.current - 1) {
        event.preventDefault()
        onNavigateRef.current(currentIndex + 1)
        return
      }
      if (event.key !== "Tab" || !panelRef.current) return
      // offsetParent is null for elements inside the hidden branch
      // (mobile layout on xl, sidebar layout below xl) — skip those.
      const focusable = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
        .filter((el) => el.offsetParent !== null)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1)
      if (!first || !last) return
      const active = document.activeElement
      const outsidePanel = !panelRef.current.contains(active)
      const atBoundary = (event.shiftKey && active === first) || (!event.shiftKey && active === last)
      if (outsidePanel || atBoundary) {
        event.preventDefault()
        if (outsidePanel || (!event.shiftKey && active === last)) first.focus()
        else last.focus()
      }
    }

    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [])

  if (!entry) return null

  const name = entryName(entry, t)
  const statRows = [
    { label: t.stats.position, value: `#${entry.position}` },
    { label: t.stats.points, value: formatCompactNumber(entry.puntos) },
    { label: t.stats.peakPoints, value: formatCompactNumber(entry.max_puntos ?? 0) },
    { label: t.stats.watchTime, value: formatWatchtime(entry.watchtime_minutes) },
    { label: t.stats.movement, value: movementText(entry, t) },
    { label: t.stats.previousPosition, value: entry.previous_position ? `#${entry.previous_position}` : "—" },
    { label: t.stats.previousPoints, value: entry.previous_points == null ? "—" : formatCompactNumber(entry.previous_points) },
  ]

  const identity = (titleId?: string) => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">{interpolate(t.stats.rank, { position: entry.position })}</span>
        <h2 id={titleId} className="text-[17px] font-medium text-foreground">{name}</h2>
        {entry.display_name && entry.display_name !== name && (
          <span className="text-[12px] text-muted-foreground">{entry.display_name}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {entry.is_subscriber && <SubscriberBadge durationMonths={entry.subscription_duration_months} size={25} />}
        {Boolean(entry.is_vip) && <VipBadge size={25} />}
      </div>
    </div>
  )

  const statList = (
    <div className="flex flex-col">
      {statRows.map((row, rowIndex) => (
        <div key={row.label} className={cn("flex items-start justify-between gap-3 py-2", rowIndex > 0 && "border-t border-border/30")}>
          <span className="shrink-0 text-[12px] text-muted-foreground">{row.label}</span>
          <span className="text-right text-[12px] font-medium text-foreground">{row.value}</span>
        </div>
      ))}
    </div>
  )

  return (
    <>
      <dialog
        ref={panelRef}
        tabIndex={-1}
        open
        aria-modal="true"
        aria-labelledby="leaderboard-profile-title"
        onCancel={(event) => {
          event.preventDefault()
          onClose()
        }}
        className="overlay-enter fixed inset-y-0 left-0 right-0 z-50 m-0! h-dvh! w-full! max-h-none! xl:h-screen! max-w-none! border-0! p-0! flex! flex-col overflow-hidden bg-transparent xl:bg-background xl:left-[max(252px,calc(50vw-588px))] xl:right-auto xl:w-[292px]!"
      >
        {/* Mobile / tablet — profile detail as a page over a blurred version of
            the avatar, matching the shop product overlay: the avatar header
            shrinks on scroll and the glass card scrolls over it. */}
        <div
          ref={overlayRef}
          className="relative min-h-0 flex-1 overflow-y-auto xl:hidden"
        >
          {/* Blurred avatar fills the background so the page subtly takes on
              its colors, same as the product overlay's image bleed. */}
          <div className="absolute inset-0 -z-20 bg-background" aria-hidden="true">
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="size-full object-cover blur-3xl opacity-40" />
            )}
          </div>
          <div className="absolute inset-0 -z-10 bg-background/80" aria-hidden="true" />

          <OverlayTitleBar
            titleRef={titleRef}
            titleTextRef={titleTextRef}
            title={name}
            index={index}
            count={entries.length}
            onClose={onClose}
            onNavigate={onNavigate}
            labels={{ close: t.close, previous: t.previousUser, next: t.nextUser }}
          />
          <MobileAvatarHeader
            key={entry.usuario_id}
            name={name}
            avatar={avatar}
            headerRef={headerRef}
          />
          <div className="relative z-10 flex min-h-[calc(100vh-240px)] flex-col rounded-t-3xl bg-background/75 ring-1 ring-border/20 backdrop-blur-[14px]">
            <div
              key={entry.usuario_id}
              className="overlay-content flex min-h-0 flex-1 flex-col gap-6 px-5 pt-6 pb-10"
            >
              {identity()}
              {statList}
            </div>
          </div>
        </div>

        {/* Desktop — static metadata sidebar above the lightbox backdrop,
            same as the shop product overlay. */}
        <div className="hidden min-h-0 flex-1 flex-col xl:flex">
          <OverlayNavHeader
            index={index}
            count={entries.length}
            onClose={onClose}
            onNavigate={onNavigate}
            labels={{ close: t.close, previous: t.previousUser, next: t.nextUser }}
          />
          <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-5">
            <div key={entry.usuario_id} className="overlay-content flex flex-col gap-6">
              {identity("leaderboard-profile-title")}
              {statList}
            </div>
          </div>
        </div>
      </dialog>

      <div className="pointer-events-none fixed inset-y-0 left-0 right-0 z-40 hidden flex-row overflow-hidden xl:flex xl:left-[max(252px,calc(50vw-588px))]">
        <div aria-hidden="true" className="pointer-events-auto absolute inset-0 bg-background/75 backdrop-blur-[8px]" />
        <div className="relative z-10 w-[292px] shrink-0" />
        <div className="relative z-10 flex min-w-0 flex-1 items-center justify-center p-8">
          <ProfileImage name={name} avatar={avatar} />
        </div>
      </div>
    </>
  )
}
