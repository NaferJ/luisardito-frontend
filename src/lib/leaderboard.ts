import { apiFetch } from '@/lib/api'

export interface LeaderboardEntry {
  usuario_id: number
  nickname: string
  puntos: number
  position: number
  position_change: number
  change_indicator: 'up' | 'down' | 'neutral' | 'new'
  previous_position: number | null
  previous_points: number | null
  is_vip: boolean
  is_subscriber: boolean
  watchtime_minutes?: number
  max_puntos?: number
  message_count?: number
  kick_data: {
    avatar_url?: string
    username?: string
  } | null
}

interface LeaderboardResponse {
  data: LeaderboardEntry[]
}

/** Fetch the top N leaderboard entries by points. */
export async function getTopLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
  try {
    const response = await apiFetch<LeaderboardResponse>(
      `/api/leaderboard?limit=${limit}`,
      { skipAuth: true },
    )
    return response.data ?? []
  } catch {
    return []
  }
}
