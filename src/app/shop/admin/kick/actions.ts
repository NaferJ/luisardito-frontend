"use server"

import { revalidatePath } from "next/cache"
import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"

/** Update Kick points configuration (single key). */
export async function updateKickPointsConfig(
  configKey: string,
  configValue: number,
  enabled?: boolean,
): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const body: Record<string, unknown> = { config_value: configValue }
  if (enabled !== undefined) body.enabled = enabled

  const response = await fetch(`${API_BASE_URL}/api/kick/points-config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ [configKey]: configValue }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/kick")
  return {}
}

/** Update VIP points configuration. */
export async function updateVipConfig(
  vipPointsEnabled: boolean,
  vipChatPoints: number,
  vipFollowPoints: number,
  vipSubPoints: number,
): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/vip-config`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      vip_points_enabled: vipPointsEnabled,
      vip_chat_points: vipChatPoints,
      vip_follow_points: vipFollowPoints,
      vip_sub_points: vipSubPoints,
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/kick")
  return {}
}

/** Toggle Botrix migration. */
export async function toggleMigration(enabled: boolean): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/migration`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ migration_enabled: enabled }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/kick")
  return {}
}
