import type { ReactNode } from "react"
import { LocaleLink } from "@/components/i18n/locale-link"
import { SiteSidebar } from "@/components/site-sidebar"
import { OnlineStatus } from "@/components/online-status"

export function SiteShell({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-4 p-4 xl:flex-row xl:gap-8">
      <SiteSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6 xl:pl-[236px]">
        {/* Desktop only — on mobile this lives in the compact top bar
            instead of taking its own row above the page content. */}
        <div className="hidden justify-end xl:flex">
          <OnlineStatus />
        </div>
        <main className="page-transition min-w-0 flex-1">{children}</main>
        {/* Mobile page footer — the desktop sidebar already shows this
            content, so on mobile we render a compact version at the end of
            the page instead of hiding it behind the hamburger menu. */}
        <footer className="mt-auto border-t border-border pt-4 pb-[max(env(safe-area-inset-bottom)+2.5rem,2.5rem)] text-[13px] text-muted-foreground xl:hidden">
          <p className="mb-3 leading-relaxed font-medium text-foreground">
            The community hub for Luisardito, Luisardium and Luisarvoid.
          </p>
          <div className="flex items-center justify-between">
            <span>&copy; 2026</span>
            <div className="flex items-center gap-4">
              <LocaleLink href="/info" className="transition-colors hover:text-foreground">
                Info
              </LocaleLink>
              <LocaleLink href="/changelog" className="transition-colors hover:text-foreground">
                Changelog
              </LocaleLink>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
