import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import {
  getLeaderboardPage,
  getMyLeaderboardPosition,
  getLeaderboardStats,
} from '@/lib/leaderboard'
import { LeaderboardView } from '@/components/shop/leaderboard-view'

export const metadata: Metadata = {
  title: 'Leaderboard — Luisardito Shop',
  description: 'Top users ranked by points earned.',
}

const INITIAL_PAGE_SIZE = 25

export default async function LeaderboardPage() {
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
        <h1 className="text-[15px] font-medium text-foreground">Leaderboard</h1>
        <p className="text-[15px] text-muted-foreground">
          {meta && meta.total > 0
            ? `${meta.total} ranked users`
            : 'Real-time rankings by points.'}
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
