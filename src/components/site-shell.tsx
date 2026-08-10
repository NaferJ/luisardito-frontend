import type { ReactNode } from "react"
import { SiteSidebar } from "@/components/site-sidebar"
import { OnlineStatus } from "@/components/online-status"

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-8 p-4 lg:flex-row lg:gap-8">
      <SiteSidebar />
      <div className="flex min-w-0 flex-1 flex-col gap-6 lg:pl-[236px]">
        <div className="flex justify-end">
          <OnlineStatus />
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
