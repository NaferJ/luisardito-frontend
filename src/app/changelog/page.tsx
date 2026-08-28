import type { Metadata } from "next"
import { SiteShell } from "@/components/site-shell"
import { ChangelogReleaseCard } from "@/components/changelog-release"
import { releases } from "@/content/changelog"

export const metadata: Metadata = {
  title: "Changelog — Luisardito",
  description:
    "Release notes and version history for the Luisardito platform.",
}

export default function ChangelogPage() {
  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="flex flex-col gap-3 pt-6">
          <h1 className="text-4xl font-semibold text-balance text-foreground sm:text-5xl">
            Changelog
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-pretty text-muted-foreground">
            Every release of the Luisardito platform, newest first.
          </p>
        </div>

        {releases.length === 0 ? (
          <p className="text-center text-[14px] text-muted-foreground">
            No changelog entries yet.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {releases.map((release, index) => (
              <ChangelogReleaseCard
                key={release.version}
                release={release}
                defaultExpanded={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  )
}
