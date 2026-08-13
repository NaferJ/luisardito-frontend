export interface Usuario {
  id: number
  nombre?: string
  nickname?: string
  email: string
  puntos: number
  rol_id: number
  user_id_ext?: string
  created_at?: string
  updated_at?: string
  creado: string
  actualizado: string

  kick_user_id?: string
  kick_username?: string
  kick_avatar?: string
  kick_data?: {
    username: string
    avatar_url: string
  }
  avatar_url?: string

  discord_username?: string

  discordLinked: boolean
  discordUsername?: string

  display_name?: string
  discord_info?: {
    linked: boolean
    id: string
    username: string
    discriminator: string
    avatar: string
    display_name: string
    linked_at: string
  }

  is_vip?: boolean
  vip_info?: {
    is_vip: boolean
    is_active: boolean
    granted_at?: string
    expires_at?: string
    granted_by_canje_id?: number
    is_permanent: boolean
  }
  vip_status?: {
    is_active: boolean
    is_permanent: boolean
    expires_soon?: boolean
    expires_at?: string
  }

  subscriber_status?: {
    is_active: boolean
    expires_soon?: boolean
  }

  migration_status?: {
    can_migrate: boolean
    migrated?: boolean
    migrated_at?: string
    points_migrated?: number
  }

  user_type?: 'regular' | 'vip' | 'subscriber'
}

export interface MetadataVisual {
  badge: {
    texto: string
    posicion: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    animacion: 'pulse' | 'bounce' | 'none'
  }
  gradiente: [string, string]
  badge_color: string
  mostrar_countdown: boolean
  mostrar_ahorro: boolean
}

export interface ReglasAplicacion {
  productos_ids: number[]
  categorias_ids: number[]
  excluir_productos_ids: number[]
  minimo_cantidad: number
}

export interface Promocion {
  id: number
  codigo: string | null
  nombre: string
  titulo: string
  descripcion: string | null
  tipo: 'producto' | 'categoria' | 'global' | 'por_cantidad'
  tipo_descuento: 'porcentaje' | 'fijo' | '2x1' | '3x2'
  valor_descuento: number
  descuento_maximo: number | null
  fecha_inicio: string
  fecha_fin: string
  cantidad_usos_maximos: number | null
  cantidad_usos_actuales: number
  usos_por_usuario: number
  minimo_puntos: number
  requiere_codigo: boolean
  prioridad: number
  estado: 'activo' | 'programado' | 'expirado' | 'inactivo' | 'pausado'
  aplica_acumulacion: boolean
  metadata_visual: MetadataVisual
  reglas_aplicacion: ReglasAplicacion
  creado_por: number | null
  creado: string
  actualizado: string
  productos?: Producto[]
}

export interface DescuentoProducto {
  tieneDescuento: boolean
  precioOriginal: number
  precioFinal: number
  descuento: number
  porcentajeDescuento: string
  promocion: {
    id: number
    codigo: string | null
    titulo: string
    descripcion: string
    tipo_descuento: string
    valor_descuento: number
    fecha_fin: string
    metadata_visual: MetadataVisual
  } | null
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio: number
  stock: number
  imagen?: string
  imagen_url?: string
  /** Original pixel width of the product image (from Cloudinary upload). NULL until populated. */
  imagen_width?: number | null
  /** Original pixel height of the product image (from Cloudinary upload). NULL until populated. */
  imagen_height?: number | null
  estado: 'borrador' | 'publicado' | 'eliminado'
  created_at: string
  updated_at: string
  /** Backend field name for createdAt (Spanish). */
  creado?: string
  /** Backend field name for updatedAt (Spanish). */
  actualizado?: string
  canjes_count?: number
  slug?: string
  descuento?: DescuentoProducto
  promocion_id?: number | null
  /** Most recent non-cancelled redemption of this product, or null if never redeemed. */
  ultimo_canje?: {
    usuario_id: number
    nickname: string
    display_name?: string
    avatar?: string
    kick_data?: {
      avatar_url?: string
      username?: string
    } | null
    fecha: string
  } | null
  promociones_activas?: Array<{
    id: number
    codigo: string | null
    titulo: string
    tipo_descuento: string
    valor_descuento: number
    descripcion?: string
    fecha_fin?: string
    metadata_visual?: MetadataVisual
    requiere_codigo?: boolean
  }>
}

export interface PromocionEstadisticas {
  promocion: {
    id: number
    nombre: string
    titulo: string
    estado: string
    fecha_inicio: string
    fecha_fin: string
    tipo_descuento: string
    valor_descuento: number
  }
  estadisticas: {
    total_usos: number
    usos_maximos: number | null
    puntos_descontados_total: number
    descuento_promedio: number
    usuarios_unicos: number
    productos_aplicables: number
  }
  topUsuarios: Array<{
    usuario_id: number
    usos: number
    ahorro_total: number
    Usuario: {
      username: string
      email: string
    }
  }>
  topProductos: Array<{
    producto_id: number
    canjes: number
    Producto: {
      nombre: string
      precio: number
      imagen_url: string
    }
  }>
}

export interface Canje {
  id: number
  usuario_id: number
  producto_id: number
  precio_al_canje?: number
  estado: 'pendiente' | 'entregado' | 'cancelado' | 'devuelto'
  fecha: string
  /** Sequelize association — backend returns capitalized field names. */
  Producto?: Producto
  /** Sequelize association — backend returns capitalized field names. */
  Usuario?: Usuario
  /** Lowercase aliases for backward compatibility. */
  producto?: Producto
  usuario?: Usuario
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  nombre: string
  email: string
  password: string
  user_id_ext?: string
}

export interface AuthResponse {
  token?: string
  accessToken?: string
  refreshToken?: string
  usuario?: Usuario
  user?: Usuario
  expiresIn?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ProductoForm {
  nombre: string
  descripcion: string
  precio: number
  stock: number
  imagen?: string
  estado: 'borrador' | 'publicado' | 'eliminado'
}

export interface UsuarioUpdateForm {
  nombre: string
  email: string
}

export interface KickConnectionStatus {
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
  subscriptions?: {
    auto_subscribed: boolean
    total_active: number
    events: Array<{
      event_type: string
      status: string
      created_at: string
    }>
  }
}

export interface KickPointsConfig {
  id: number
  config_key: string
  config_value: number
  enabled: boolean
  description?: string
  created_at: string
  updated_at: string
}

export interface KickSubscription {
  id: string
  event_type: string
  broadcaster_user_id: string
  status: string
  created_at: string
}

export interface VipConfig {
  points_enabled: boolean
  chat_points: number
  follow_points: number
  sub_points: number
  stats: {
    active_vips: number
    expired_vips: number
  }
}

export interface MigrationConfig {
  enabled: boolean
  stats: {
    migrated_users: number
    total_points_migrated: number
  }
}

export interface VipConfigUpdateRequest {
  vip_points_enabled?: boolean
  vip_chat_points?: number
  vip_follow_points?: number
  vip_sub_points?: number
}

export interface MigrationConfigUpdateRequest {
  migration_enabled: boolean
}

export interface KickAdminConfig {
  success: boolean
  migration: MigrationConfig
  vip: VipConfig
}

export interface HistorialPunto {
  id: number
  usuario_id: number
  cambio: number | null
  puntos?: number
  motivo: string
  concepto?: string
  tipo?: 'ganado' | 'gastado' | 'evento' | 'ajuste'
  fecha: string
  kick_event_data?: {
    event_type: string
    kick_username?: string
    kick_user_id?: string
    points_migrated?: number
    migrated_from?: string
    duration_days?: number
    expires_at?: string
    granted_by_canje_id?: number
    canje_id?: number
    granted_at?: string
    is_vip?: boolean
    user_type?: string
    kick_amount?: number
    gift_name?: string
    gift_type?: string
    gift_tier?: string
    gift_message?: string
    original_points?: number
    created_at?: string
  }
}
