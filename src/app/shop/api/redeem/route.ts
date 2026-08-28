import { NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api'
import { getAuthToken } from '@/lib/cookies'

/**
 * Proxy for product redemption. The frontend calls this with
 * { productoId: number } (English). We translate to the backend's
 * Spanish format { producto_id: number } and forward to POST /api/canjes.
 *
 * Auth is read from the httpOnly cookie set during login — the browser
 * sends it automatically, and we forward it as a Bearer token to the backend.
 */
export async function POST(request: Request): Promise<Response> {
  const token = await getAuthToken()
  if (!token) {
    return NextResponse.json(
      { error: 'You must be logged in to redeem.' },
      { status: 401 },
    )
  }

  let body: { productoId?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body.' },
      { status: 400 },
    )
  }

  if (!body.productoId) {
    return NextResponse.json(
      { error: 'Product ID is required.' },
      { status: 400 },
    )
  }

  // Translate to the backend's Spanish field name.
  const response = await fetch(`${API_BASE_URL}/api/canjes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ producto_id: body.productoId }),
    cache: 'no-store',
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          (data as { error?: string; message?: string }).error ??
          (data as { message?: string }).message ??
          'Redemption failed.',
      },
      { status: response.status },
    )
  }

  return NextResponse.json(data)
}
