import Link from "next/link"
import { SiteShell } from "@/components/site-shell"

/**
 * Root 404 page. Rendered by Next.js when no route matches, or when a server
 * component calls notFound() without a closer not-found.tsx (e.g. an invalid
 * shop slug). Uses the same shell as the rest of the site so the sidebar and
 * side decorations remain consistent.
 */
export default function NotFound() {
  return (
    <SiteShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-[15px] font-medium text-gold-bright">404</h1>
          <p className="text-[15px] text-foreground">Page not found</p>
          <p className="text-[13px] text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="flex h-8 items-center justify-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
        >
          Back home
        </Link>
      </div>
    </SiteShell>
  )
}
