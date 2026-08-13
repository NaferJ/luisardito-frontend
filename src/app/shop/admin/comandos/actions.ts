"use server"

import { revalidatePath } from "next/cache"
import { API_BASE_URL } from "@/lib/api"
import { getAuthToken } from "@/lib/cookies"

export interface BotCommandFormData {
  command: string
  aliases: string[]
  response_message: string
  description?: string
  command_type: "simple" | "dynamic"
  enabled: boolean
  requires_permission: boolean
  permission_level: "viewer" | "vip" | "moderator" | "broadcaster"
  cooldown_seconds: number
}

export async function createBotCommand(formData: BotCommandFormData): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/bot-commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/comandos")
  return {}
}

export async function updateBotCommand(
  id: string,
  formData: BotCommandFormData,
): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/bot-commands/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(formData),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/comandos")
  return {}
}

export async function toggleBotCommand(id: string): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/bot-commands/${id}/toggle`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/comandos")
  return {}
}

export async function deleteBotCommand(id: string): Promise<{ error?: string }> {
  const token = await getAuthToken()
  if (!token) return { error: "Not authenticated" }

  const response = await fetch(`${API_BASE_URL}/api/kick-admin/bot-commands/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    return { error: (data as { error?: string }).error ?? `Failed (${response.status})` }
  }

  revalidatePath("/shop/admin/comandos")
  return {}
}
