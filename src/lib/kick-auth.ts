const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export function getKickOAuthUrl(): string {
  return `${API_BASE_URL.replace(/\/$/, '')}/api/auth/kick`
}
