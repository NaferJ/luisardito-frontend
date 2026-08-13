import { apiFetch } from '@/lib/api'
import type { Canje, Promocion, Usuario } from '@/types'
import type { BotCommand } from '@/lib/comandos'

// ─── Canjes (admin) ───

/** Fetch all redemptions (admin only). */
export async function getAllCanjes(): Promise<Canje[]> {
  try {
    const response = await apiFetch<{ data: Canje[] } | Canje[]>('/api/canjes')
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}

// ─── Usuarios (admin) ───

export interface AdminUsuario extends Usuario {
  kick_data?: {
    username: string
    avatar_url: string
  } | null
  vip_info?: {
    is_active: boolean
    is_permanent: boolean
    expires_at?: string
    granted_at?: string
  }
  migration_status?: {
    can_migrate: boolean
    migrated?: boolean
    migrated_at?: string
    points_migrated?: number
  }
}

/** Fetch all users (admin only). */
export async function getAllUsuarios(): Promise<AdminUsuario[]> {
  try {
    const response = await apiFetch<{ data: AdminUsuario[] } | AdminUsuario[]>('/api/usuarios')
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}

/** Fetch a single user by ID (admin only). */
export async function getUsuarioById(id: string): Promise<AdminUsuario | null> {
  try {
    return await apiFetch<AdminUsuario>(`/api/usuarios/${id}`)
  } catch {
    return null
  }
}

// ─── Promociones (admin) ───

/** Fetch all promotions with filters (admin only). */
export async function getAllPromociones(): Promise<Promocion[]> {
  try {
    const response = await apiFetch<{ data: Promocion[] } | Promocion[]>('/api/promociones')
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}

/** Fetch a single promotion by ID (admin only). */
export async function getPromocionById(id: string): Promise<Promocion | null> {
  try {
    return await apiFetch<Promocion>(`/api/promociones/${id}`)
  } catch {
    return null
  }
}

// ─── Bot Commands (admin) ───

/** Fetch all bot commands (admin only). */
export async function getAllBotCommands(): Promise<BotCommand[]> {
  try {
    const response = await apiFetch<{ data: BotCommand[] } | BotCommand[]>(
      '/api/kick-admin/bot-commands',
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}

// ─── Kick Config (admin) ───

export interface KickPointsConfigEntry {
  id: number
  config_key: string
  config_value: number
  enabled: boolean
  description?: string
}

export interface KickAdminConfig {
  success: boolean
  migration: {
    enabled: boolean
    stats: { migrated_users: number; total_points_migrated: number }
  }
  vip: {
    points_enabled: boolean
    chat_points: number
    follow_points: number
    sub_points: number
    stats: { active_vips: number; expired_vips: number }
  }
}

export interface BroadcasterStatus {
  connected: boolean
  broadcaster?: {
    kick_user_id: string
    kick_username: string
    connected_at: string
  }
  token?: {
    expires_at: string
    is_expired: boolean
  }
}

/** Fetch Kick points configuration (public). */
export async function getKickPointsConfig(): Promise<KickPointsConfigEntry[]> {
  try {
    const response = await apiFetch<{ data: KickPointsConfigEntry[] } | KickPointsConfigEntry[]>(
      '/api/kick/points-config',
      { skipAuth: true },
    )
    return Array.isArray(response) ? response : (response.data ?? [])
  } catch {
    return []
  }
}

/** Fetch Kick admin config (migration + VIP). */
export async function getKickAdminConfig(): Promise<KickAdminConfig | null> {
  try {
    return await apiFetch<KickAdminConfig>('/api/kick-admin/config')
  } catch {
    return null
  }
}

/** Fetch broadcaster connection status. */
export async function getBroadcasterStatus(): Promise<BroadcasterStatus | null> {
  try {
    return await apiFetch<BroadcasterStatus>('/api/kick/broadcaster/status')
  } catch {
    return null
  }
}
