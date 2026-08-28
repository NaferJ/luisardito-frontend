"use server"

import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"

/** Result returned by fetchWithAuth for non-redirect operations. */
type FetchResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; error: string }

interface FetchWithAuthOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  body?: unknown
  /** Whether to send Content-Type: application/json (default: true for POST/PUT/PATCH). */
  json?: boolean
}

/** Make an authenticated fetch to the backend API from a server action.
 *  Handles token retrieval, headers, error parsing, and no-store caching. */
export async function fetchWithAuth<T = unknown>(
  options: FetchWithAuthOptions,
): Promise<FetchResult<T>> {
  const token = await getAuthToken()
  if (!token) return { ok: false, error: "Not authenticated" }

  const { method, path, body, json = method !== "GET" && method !== "DELETE" } = options

  const headers: Record<string, string> = { Authorization: `Bearer ${token}` }
  if (json) headers["Content-Type"] = "application/json"

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const error =
      (data as { error?: string }).error ??
      (data as { message?: string }).message ??
      `Failed (${response.status})`
    return { ok: false, error }
  }

  const data = (await response.json().catch(() => ({}))) as T
  return { ok: true, data }
}

/** Like fetchWithAuth but throws on error instead of returning a result.
 *  Use when the caller needs the response data and wants to propagate errors. */
export async function fetchWithAuthOrThrow<T = unknown>(
  options: FetchWithAuthOptions,
): Promise<T> {
  const result = await fetchWithAuth<T>(options)
  if (!result.ok) throw new Error(result.error)
  return result.data
}
