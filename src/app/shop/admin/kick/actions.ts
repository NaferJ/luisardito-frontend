"use server"

import { revalidatePath } from "next/cache"
import { fetchWithAuth } from "@/lib/admin-fetch"

/** Update Kick points configuration (single key). */
export async function updateKickPointsConfig(
  configKey: string,
  configValue: number,
  enabled?: boolean,
): Promise<{ error?: string }> {
  const body: Record<string, unknown> = { config_key: configKey, config_value: configValue }
  if (enabled !== undefined) body.enabled = enabled

  const result = await fetchWithAuth({ method: "PUT", path: "/api/kick/points-config", body })
  if (!result.ok) return { error: result.error }
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
  const result = await fetchWithAuth({
    method: "PUT",
    path: "/api/kick-admin/vip-config",
    body: {
      vip_points_enabled: vipPointsEnabled,
      vip_chat_points: vipChatPoints,
      vip_follow_points: vipFollowPoints,
      vip_sub_points: vipSubPoints,
    },
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/kick")
  return {}
}

/** Toggle Botrix migration. */
export async function toggleMigration(enabled: boolean): Promise<{ error?: string }> {
  const result = await fetchWithAuth({
    method: "PUT",
    path: "/api/kick-admin/migration",
    body: { migration_enabled: enabled },
  })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/kick")
  return {}
}
