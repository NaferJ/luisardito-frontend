import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { ChangelogReleaseCard } from "@/components/changelog-release"
import { releases } from "@/content/changelog"
import { dictionaries, hasLocale, type Locale } from "@/lib/i18n"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return { title: `${dictionaries[locale].changelog.title} — Luisardito`, description: dictionaries[locale].changelog.description }
}

export default async function ChangelogPage() {
  const dictionary = await import("@/lib/i18n").then(({ getDictionary }) => getDictionary())
  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
        <div className="flex flex-col gap-3 pt-6">
          <h1 className="text-4xl font-semibold text-balance text-foreground sm:text-5xl">{dictionary.changelog.title}</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-pretty text-muted-foreground">{dictionary.changelog.description}</p>
        </div>
        {releases.length === 0 ? <p className="text-center text-[14px] text-muted-foreground">{dictionary.changelog.empty}</p> : <div className="flex flex-col gap-4">{releases.map((release, index) => <ChangelogReleaseCard key={release.version} release={release} defaultExpanded={index === 0} />)}</div>}
      </div>
    </SiteShell>
  )
}
