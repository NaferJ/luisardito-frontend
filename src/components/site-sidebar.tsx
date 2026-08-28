"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { browseLinks, accountLinks, adminLinks, avatarColors } from "@/lib/nav-data"
import { getKickOAuthUrl } from "@/lib/kick-auth"
import { logout } from "@/app/shop/auth/actions"
import { useUser } from "@/components/user-provider"
import { PendingCanjesBadge } from "@/components/pending-canjes-badge"
import { cn } from "@/lib/utils"

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

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
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

export function SiteSidebar() {
  const pathname = usePathname()
  const [isRedirecting, setIsRedirecting] = useState(false)
  const user = useUser()

  const handleKickLogin = () => {
    setIsRedirecting(true)
    window.location.href = getKickOAuthUrl()
  }

  const displayName = user
    ? user.nickname ?? user.kick_username ?? user.display_name ?? user.nombre ?? user.email ?? 'User'
    : ''
  const avatarSrc = user
    ? user.kick_data?.avatar_url ?? user.avatar_url ?? user.kick_avatar ?? undefined
    : undefined

  const visibleHrefs: string[] = [
    ...browseLinks.map((l) => l.href),
    ...(user ? accountLinks.map((l) => l.href) : []),
    ...(user && user.rol_id >= 3 ? adminLinks.map((l) => l.href) : []),
  ]
  const activeHref = getActiveHref(pathname, visibleHrefs)

  return (
    <aside className="flex w-full flex-col gap-8 border-b border-border pb-8 lg:fixed lg:inset-y-0 lg:left-[max(1rem,calc((100vw-1680px)/2+1rem))] lg:w-[220px] lg:justify-between lg:border-b-0 lg:py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Logo />
          {user ? (
            <Link
              href="/shop/perfil"
              className="flex items-center gap-2 rounded-full bg-secondary px-2.5 py-1 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
            >
              {avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarSrc}
                  alt={displayName}
                  className="size-5 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-5 items-center justify-center rounded-full bg-gold-core text-[10px] font-medium text-background">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="max-w-[80px] truncate">{displayName}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleKickLogin}
              disabled={isRedirecting}
              className="h-7 rounded-full bg-secondary px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
            >
              {isRedirecting ? "..." : "Log in"}
            </button>
          )}
        </div>

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
      </div>

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
                className="h-8 rounded-full bg-secondary px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
              >
                Log out
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleKickLogin}
              disabled={isRedirecting}
              className="h-8 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
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
        </div>
      </div>
    </aside>
  )
}
