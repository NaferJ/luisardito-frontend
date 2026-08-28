import { apiFetch } from '@/lib/api'

export interface BotCommand {
  id: number
  command: string
  aliases: string[]
  response_message: string
  description?: string | null
  command_type: 'simple' | 'dynamic'
  dynamic_handler?: string | null
  enabled: boolean
  requires_permission: boolean
  permission_level: 'viewer' | 'vip' | 'moderator' | 'broadcaster' | null
  cooldown_seconds: number
  usage_count: number
  last_used_at?: string | null
  auto_send_interval_seconds: number
  created_at: string
  updated_at: string
}

/** Fetch all public bot commands. Public endpoint. */
export async function getPublicBotCommands(): Promise<BotCommand[]> {
  try {
    const response = await apiFetch<{ data: BotCommand[] } | BotCommand[]>(
      '/api/kick-admin/bot-commands/public',
      { skipAuth: true },
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}
