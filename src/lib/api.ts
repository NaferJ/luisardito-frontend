import { getAuthToken } from '@/lib/cookies'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

interface ApiFetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options

  const requestHeaders = new Headers(headers)
  requestHeaders.set('Content-Type', 'application/json')

  if (!skipAuth) {
    const token = await getAuthToken()
    if (token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders,
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message =
      (errorBody as { error?: string; message?: string }).error ??
      (errorBody as { message?: string }).message ??
      `API error: ${response.status}`
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export { API_BASE_URL }
