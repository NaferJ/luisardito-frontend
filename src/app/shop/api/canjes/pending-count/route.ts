import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api'
import { getAuthToken } from '@/lib/cookies'

/**
 * Returns the count of pending redemptions for the admin nav badge.
 * Proxies to GET /api/canjes?estado=pendiente and returns just the count.
 */
export async function GET(): Promise<Response> {
  const token = await getAuthToken()
  if (!token) {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/canjes?estado=pendiente`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      return NextResponse.json({ count: 0 }, { status: 200 })
    }

    const data = await response.json()
    const canjes = Array.isArray(data) ? data : (data as { data?: unknown[] }).data ?? []
    return NextResponse.json(
      { count: Array.isArray(canjes) ? canjes.length : 0 },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store, max-age=0' },
      },
    )
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
