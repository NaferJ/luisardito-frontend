/** Client-safe fetch for public API endpoints.
 *  Unlike `apiFetch` in `api.ts`, this does not import `next/headers`
 *  and is safe to use inside Client Components. Only use for endpoints
 *  that do NOT require authentication. */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function publicApiFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export { API_BASE_URL }
