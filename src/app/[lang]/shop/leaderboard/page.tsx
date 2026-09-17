import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import {
  getLeaderboardPage,
  getLeaderboardStats,
  getMyLeaderboardPosition,
} from '@/lib/leaderboard'
import { LeaderboardView } from '@/components/shop/leaderboard-view'
import {
  dictionaries,
  getDictionary,
  hasLocale,
  type Locale,
} from '@/lib/i18n'
import { interpolate } from '@/lib/i18n/shared'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale: Locale = lang
  return {
    title: dictionaries[locale].leaderboard.metaTitle,
    description: dictionaries[locale].leaderboard.metaDescription,
  }
}

const INITIAL_PAGE_SIZE = 25

export default async function LeaderboardPage() {
  const dictionary = await getDictionary()
  const [{ entries, meta }, stats, user] = await Promise.all([
    getLeaderboardPage(INITIAL_PAGE_SIZE, 0),
    getLeaderboardStats(),
    getCurrentUser(),
  ])

  // Only fetch my position if authenticated
  const myPosition = user ? await getMyLeaderboardPosition() : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">{dictionary.leaderboard.title}</h1>
        <p className="text-[15px] text-muted-foreground">
          {meta && meta.total > 0
            ? interpolate(dictionary.leaderboard.rankedCount, { n: meta.total })
            : dictionary.leaderboard.subtitleFallback}
        </p>
      </div>

      <LeaderboardView
        initialEntries={entries}
        meta={meta}
        stats={stats}
        myPosition={myPosition}
        myUserId={user?.id}
      />
    </div>
  )
}
