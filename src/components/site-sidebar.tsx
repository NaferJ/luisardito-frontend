"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { browseLinks, accountLinks, adminLinks, avatarColors } from "@/lib/nav-data"
import { getKickOAuthUrl } from "@/lib/kick-auth"
import { logout } from "@/app/shop/auth/actions"
import { useUser } from "@/components/user-provider"
import { PendingCanjesBadge } from "@/components/pending-canjes-badge"
import { OnlineStatus } from "@/components/online-status"
import { cn, formatCompactNumber } from "@/lib/utils"

/**
 * Returns the single nav href that best matches `pathname`.
 * A href matches when it is either exact or a parent segment
 * (`pathname === href || pathname.startsWith(href + "/")`).
 * The longest matching href wins so that, e.g. on
 * `/shop/admin/promociones/new`, "Promotions" stays active instead of
 * the more generic "Shop" link.
 */
function getActiveHref(pathname: string, hrefs: readonly string[]): string {
  let best = ""
  for (const href of hrefs) {
    if (pathname === href || pathname.startsWith(`${href}/`)) {
      if (href.length > best.length) best = href
    }
  }
  return best
}

function Logo() {
  return (
    <Link href="/" aria-label="Luisardito" className="inline-block text-foreground">
      <Image src="/icon.svg" alt="Luisardito" width={26} height={26} className="text-foreground" />
    </Link>
  )
}

function NavLink({ href, label, active }: Readonly<{ href: string; label: string; active: boolean }>) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-1.5 text-[13px] leading-none transition-colors",
        active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      {active && (
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-gold shadow-[0_0_0_3px_#D49A22_/_0.25]"
        />
      )}
    </Link>
  )
}

/** User avatar/login pill shown next to the logo, in both the mobile top
 * bar and the desktop sidebar. On mobile (`showPoints`) it also surfaces
 * the user's points balance right there — otherwise a user has no way to
 * see how many points they have (or how many they're about to spend)
 * without opening the drawer, which is confusing while browsing the feed. */
function AccountPill({
  user,
  isRedirecting,
  onLogin,
  showPoints = false,
}: Readonly<{
  user: ReturnType<typeof useUser>
  isRedirecting: boolean
  onLogin: () => void
  showPoints?: boolean
}>) {
  if (!user) {
    return (
      <button
        type="button"
        onClick={onLogin}
        disabled={isRedirecting}
        className="h-7 rounded-full bg-secondary px-3 text-[13px] font-medium text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-95 disabled:opacity-50"
      >
        {isRedirecting ? "..." : "Log in"}
      </button>
    )
  }

  const displayName =
    user.nickname ?? user.kick_username ?? user.display_name ?? user.nombre ?? user.email ?? "User"
  const avatarSrc = user.kick_data?.avatar_url ?? user.avatar_url ?? user.kick_avatar ?? undefined

  return (
    <Link
      href="/shop/perfil"
      className="flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1 text-[13px] font-medium text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-95"
    >
      {showPoints && (
        <span className="text-gold-bright">{formatCompactNumber(user.puntos)}</span>
      )}
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarSrc} alt={displayName} className="size-5 rounded-full object-cover" />
      ) : (
        <span className="flex size-5 items-center justify-center rounded-full bg-gold-core text-[10px] font-medium text-background">
          {displayName.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="max-w-[80px] truncate">{displayName}</span>
    </Link>
  )
}

/** Browse / Account / Admin link groups — shared by the mobile drawer and
 * the desktop sidebar so they can't drift apart. */
function NavSections({
  user,
  activeHref,
}: Readonly<{
  user: ReturnType<typeof useUser>
  activeHref: string
}>) {
  return (
    <nav className="flex flex-col gap-6 text-[13px]">
      <div className="flex flex-col gap-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Browse</span>
        {browseLinks.map((link) => (
          <NavLink key={link.href} href={link.href} label={link.label} active={link.href === activeHref} />
        ))}
      </div>
      {user && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Account</span>
          {accountLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} active={link.href === activeHref} />
          ))}
        </div>
      )}
      {user && user.rol_id >= 3 && (
        <div className="flex flex-col gap-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Admin</span>
          {adminLinks.map((link) => (
            <div key={link.href} className="flex items-center">
              <NavLink href={link.href} label={link.label} active={link.href === activeHref} />
              {link.href === "/shop/admin/canjes" && <PendingCanjesBadge />}
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}

/** Points/logout or signup block + footer links — shared by the mobile
 * drawer and the desktop sidebar. */
function SidebarFooter({
  user,
  isRedirecting,
  onLogin,
}: Readonly<{
  user: ReturnType<typeof useUser>
  isRedirecting: boolean
  onLogin: () => void
}>) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] leading-relaxed font-medium text-foreground">
        The community hub for Luisardito, Luisardium and Luisarvoid.
      </p>
      {user ? (
        <div className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-1.5 rounded-full bg-secondary px-3 text-[13px] font-medium text-foreground">
            <span className="text-gold-bright">{user.puntos.toLocaleString()}</span>
            <span className="text-muted-foreground">pts</span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="h-8 rounded-full bg-secondary px-4 text-[13px] font-medium text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-95"
            >
              Log out
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLogin}
            disabled={isRedirecting}
            className="h-8 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-[opacity,transform] duration-150 hover:opacity-85 active:scale-95 disabled:opacity-50"
          >
            {isRedirecting ? "Connecting..." : "Sign up"}
          </button>
          <div className="flex -space-x-2">
            {avatarColors.map((color, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={cn("size-7 rounded-full border-2 border-background", color)}
              />
            ))}
            <span className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-gold-core text-[11px] font-medium text-background">
              H
            </span>
          </div>
        </div>
      )}
      {!user && (
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Join 587 members, including 12 who joined last month.
        </p>
      )}

      <div className="mt-2 flex items-center gap-4 border-t border-border pt-3 text-[13px] text-muted-foreground">
        <span>© 2026</span>
        <Link href="/info" className="hover:text-foreground">
          Info
        </Link>
        <Link href="/changelog" className="hover:text-foreground">
          Changelog
        </Link>
      </div>
    </div>
  )
}

/** Full-screen mobile nav drawer, toggled from the compact top bar. Locks
 * body scroll while open and closes automatically on route change. The nav
 * sections scroll if the link list is long, while the footer stays pinned to
 * the bottom so it is always visible on mobile. */
function MobileDrawer({
  open,
  onClose,
  children,
}: Readonly<{ open: boolean; onClose: () => void; children: ReactNode }>) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-background p-4 lg:hidden">
      <div className="flex items-center justify-between pb-6">
        <Logo />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  )
}

export function SiteSidebar() {
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const user = useUser()

  // Close the drawer automatically when the route changes (e.g. after
  // tapping a nav link) instead of leaving it open over the new page.
  // Adjust state during render when the prop changes (React-recommended
  // pattern, avoids setState-in-effect cascading renders) — same approach
  // as `product-feed.tsx`'s `initialOpenIndex` sync.
  const [prevPathname, setPrevPathname] = useState(pathname)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setMobileOpen(false)
  }

  const handleKickLogin = () => {
    setIsRedirecting(true)
    window.location.href = getKickOAuthUrl()
  }

  const visibleHrefs: string[] = [
    ...browseLinks.map((l) => l.href),
    ...(user ? accountLinks.map((l) => l.href) : []),
    ...(user && user.rol_id >= 3 ? adminLinks.map((l) => l.href) : []),
  ]
  const activeHref = getActiveHref(pathname, visibleHrefs)

  return (
    <>
      {/* Mobile / tablet — compact top bar (logo + online count, account
          pill with points + menu toggle) instead of dumping the full nav
          inline above the page content. Sticky so the hamburger, points,
          and logo are always reachable while the user scrolls the feed.
          The drawer below holds the actual nav + footer. Online count
          moved here from its own row in `site-shell.tsx` (was an awkward
          extra row above the page content on small screens). Points are
          surfaced in the account pill so the user always knows their
          balance while browsing, without opening the drawer. */}
      <div className="sticky top-0 z-20 -mt-4 flex items-center justify-between gap-3 border-b border-border/50 bg-background/95 px-4 pt-4 pb-4 backdrop-blur-sm lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <OnlineStatus />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AccountPill user={user} isRedirecting={isRedirecting} onLogin={handleKickLogin} showPoints />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            className="flex size-8 items-center justify-center rounded-full bg-secondary text-foreground transition-[colors,transform] duration-150 hover:bg-accent active:scale-90"
          >
            <Menu className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <div className="flex h-full flex-col gap-6 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <NavSections user={user} activeHref={activeHref} />
          </div>
          <SidebarFooter user={user} isRedirecting={isRedirecting} onLogin={handleKickLogin} />
        </div>
      </MobileDrawer>

      {/* Desktop — static fixed sidebar, unchanged behavior. */}
      <aside className="z-20 hidden lg:fixed lg:inset-y-0 lg:left-[max(1rem,calc((100vw-1680px)/2+1rem))] lg:flex lg:w-[220px] lg:flex-col lg:justify-between lg:py-8">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <Logo />
            <AccountPill user={user} isRedirecting={isRedirecting} onLogin={handleKickLogin} />
          </div>
          <NavSections user={user} activeHref={activeHref} />
        </div>
        <SidebarFooter user={user} isRedirecting={isRedirecting} onLogin={handleKickLogin} />
      </aside>
    </>
  )
}
