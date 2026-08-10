"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { browseLinks, resourceLinks, avatarColors } from "@/lib/nav-data"
import { cn } from "@/lib/utils"

function Logo() {
  return (
    <Link href="/" aria-label="Recent" className="inline-block text-foreground">
      <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M0 0.38C0 0.17 0.17 0 0.38 0H22c5.52 0 10 4.48 10 10s-4.48 10-10 10H0V0.38Z" fill="currentColor" />
        <rect y="20" width="32" height="12" fill="currentColor" />
      </svg>
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

  return (
    <aside className="flex w-full flex-col gap-8 border-b border-border pb-8 lg:fixed lg:inset-y-0 lg:left-[max(1rem,calc((100vw-1680px)/2+1rem))] lg:w-[220px] lg:justify-between lg:border-b-0 lg:py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <Logo />
          <button
            type="button"
            className="h-7 rounded-full bg-secondary px-3 text-[13px] font-medium text-foreground transition-colors hover:bg-accent"
          >
            Log in
          </button>
        </div>

        <nav className="flex flex-col gap-6 text-[13px]">
          <div className="flex flex-col gap-2.5">
            <span className="text-muted-foreground">Browse</span>
            {browseLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
            ))}
          </div>
          <div className="flex flex-col gap-2.5">
            <span className="text-muted-foreground">Resources</span>
            {resourceLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} active={pathname === link.href} />
            ))}
          </div>
        </nav>
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-[13px] leading-relaxed font-medium text-foreground">
          A daily curation of exceptional design, websites and tools.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="h-8 rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
          >
            Sign up
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
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Join 940 creatives, including 315 who signed up yesterday.
        </p>

        <div className="mt-2 flex items-center gap-4 border-t border-border pt-3 text-[13px] text-muted-foreground">
          <span>© 2026</span>
          <Link href="/sponsor" className="hover:text-foreground">
            Sponsor
          </Link>
          <Link href="/info" className="hover:text-foreground">
            Info
          </Link>
        </div>
      </div>
    </aside>
  )
}
