import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteShell } from "@/components/site-shell"
import { CommunityComposer } from "@/components/community/composer"
import { CommunityPostCard } from "@/components/community/post-card"
import { CommunityAside } from "@/components/community/pinned-aside"
import { GridTexture } from "@/components/community/grid-texture"
import { MOCK_POSTS } from "@/components/community/mock-data"
import { dictionaries, hasLocale, type Locale } from "@/lib/i18n"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return { title: `${dictionaries[locale].community.title} — Luisardito`, description: dictionaries[locale].community.description }
}

export default async function CommunityPage() {
  const dictionary = await import("@/lib/i18n").then(({ getDictionary }) => getDictionary())
  return (
    <SiteShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-baseline gap-2">
          <h1 className="text-[15px] font-medium text-foreground">{dictionary.community.title}</h1>
          <p className="text-[15px] text-muted-foreground">{dictionary.community.description}</p>
        </div>

        <div className="@container">
          <div className="relative grid grid-cols-1 @min-[68rem]:grid-cols-[minmax(0,3fr)_minmax(34rem,2fr)]">
            <GridTexture />
            <div data-community-feed className="relative flex min-w-0 flex-col items-start [&>*+*]:-mt-px">
              <CommunityComposer />
              {MOCK_POSTS.map((post) => (
                <CommunityPostCard key={post.id} post={post} />
              ))}
            </div>
            <CommunityAside community={dictionary.community} />
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-border" />
          </div>
        </div>
      </div>
    </SiteShell>
  )
}
