import type { Metadata } from 'next'
import { getCurrentUser } from '@/lib/auth'
import { getFullLeaderboard, getMyLeaderboardPosition } from '@/lib/leaderboard'
import { LeaderboardView } from '@/components/shop/leaderboard-view'

export const metadata: Metadata = {
  title: 'Leaderboard — Luisardito Shop',
  description: 'Top users ranked by points earned.',
}

export default async function LeaderboardPage() {
  const [leaderboard, user] = await Promise.all([
    getFullLeaderboard(),
    getCurrentUser(),
  ])

  // Only fetch my position if authenticated
  const myPosition = user ? await getMyLeaderboardPosition() : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-baseline gap-2">
        <h1 className="text-[15px] font-medium text-foreground">Leaderboard</h1>
        <p className="text-[15px] text-muted-foreground">
          {leaderboard.length > 0
            ? `${leaderboard.length} ranked users`
            : 'Real-time rankings by points.'}
        </p>
      </div>

      <LeaderboardView
        entries={leaderboard}
        myPosition={myPosition}
        myUserId={user?.id}
      />
    </div>
  )
}
