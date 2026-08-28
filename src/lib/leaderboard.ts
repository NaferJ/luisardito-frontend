import { apiFetch } from '@/lib/api'

export interface LeaderboardEntry {
  usuario_id: number
  nickname: string
  display_name?: string
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
  discord_info?: {
    linked: boolean
    username: string | null
    display_name: string
  } | null
}

export interface LeaderboardMeta {
  total: number
  limit: number
  offset: number
  last_update: string | null
  next_reset_date: string | null
  days_until_reset: number | null
  hours_until_reset: number | null
}

export interface LeaderboardStats {
  total_users: number
  total_points: number
  average_points: number
  top_user: { nickname: string; puntos: number } | null
  vip_users: number
}

interface LeaderboardResponse {
  data: LeaderboardEntry[]
  meta: LeaderboardMeta
  user_position?: LeaderboardEntry | null
}

interface StatsResponse {
  stats: LeaderboardStats
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

/** Fetch a page of the leaderboard with meta (reset info, total count). */
export async function getLeaderboardPage(
  limit = 25,
  offset = 0,
): Promise<{ entries: LeaderboardEntry[]; meta: LeaderboardMeta | null }> {
  try {
    const response = await apiFetch<LeaderboardResponse>(
      `/api/leaderboard?limit=${limit}&offset=${offset}`,
      { skipAuth: true },
    )
    return {
      entries: response.data ?? [],
      meta: response.meta ?? null,
    }
  } catch {
    return { entries: [], meta: null }
  }
}

/** Fetch the full leaderboard (up to 100 entries) with meta. */
export async function getFullLeaderboard(
  limit = 100,
): Promise<{ entries: LeaderboardEntry[]; meta: LeaderboardMeta | null }> {
  try {
    const response = await apiFetch<LeaderboardResponse>(
      `/api/leaderboard?limit=${limit}`,
      { skipAuth: true },
    )
    return {
      entries: response.data ?? [],
      meta: response.meta ?? null,
    }
  } catch {
    return { entries: [], meta: null }
  }
}

/** Fetch the current user's leaderboard position. Requires auth. */
export async function getMyLeaderboardPosition(): Promise<LeaderboardEntry | null> {
  try {
    const response = await apiFetch<{ data: LeaderboardEntry } | LeaderboardEntry>(
      '/api/leaderboard/me',
    )
    return Array.isArray(response) ? response[0] ?? null : (response.data ?? response ?? null)
  } catch {
    return null
  }
}

/** Fetch general leaderboard statistics (total users, points, top user, VIP count). */
export async function getLeaderboardStats(): Promise<LeaderboardStats | null> {
  try {
    const response = await apiFetch<StatsResponse>(
      '/api/leaderboard/stats',
      { skipAuth: true },
    )
    return response.stats ?? null
  } catch {
    return null
  }
}
