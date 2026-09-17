"use server"

import { revalidatePath } from "next/cache"
import { fetchWithAuth } from "@/lib/admin-fetch"

export interface BotCommandFormData {
  command: string
  aliases: string[]
  response_message: string
  description?: string
  command_type: "simple" | "dynamic"
  dynamic_handler?: string | null
  enabled: boolean
  requires_permission: boolean
  permission_level: "viewer" | "vip" | "moderator" | "broadcaster"
  cooldown_seconds: number
  auto_send_interval_seconds: number
}

export async function createBotCommand(formData: BotCommandFormData): Promise<{ error?: string }> {
  const result = await fetchWithAuth({ method: "POST", path: "/api/kick-admin/bot-commands", body: formData })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/comandos")
  return {}
}

export async function updateBotCommand(
  id: string,
  formData: BotCommandFormData,
): Promise<{ error?: string }> {
  const result = await fetchWithAuth({ method: "PUT", path: `/api/kick-admin/bot-commands/${id}`, body: formData })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/comandos")
  return {}
}

export async function toggleBotCommand(id: string): Promise<{ error?: string }> {
  const result = await fetchWithAuth({ method: "PATCH", path: `/api/kick-admin/bot-commands/${id}/toggle` })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/comandos")
  return {}
}

export async function deleteBotCommand(id: string): Promise<{ error?: string }> {
  const result = await fetchWithAuth({ method: "DELETE", path: `/api/kick-admin/bot-commands/${id}` })
  if (!result.ok) return { error: result.error }
  revalidatePath("/shop/admin/comandos")
  return {}
}
