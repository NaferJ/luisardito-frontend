Subagent agent_id=630d32ca completed successfully:

## Complete API Endpoint List

Based on my analysis of the backend codebase, here is a complete list of all API endpoints exposed by the backend:

---

### **Health Check**
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/` | Service health check | No |

---

### **Authentication Routes** (`/api/auth`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/auth/register` | Register new user (local auth) | No |
| POST | `/api/auth/login` | Login with local credentials | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| POST | `/api/auth/logout` | Logout current session | No |
| POST | `/api/auth/logout-all` | Logout all sessions | No |
| GET | `/api/auth/kick` | Redirect to Kick OAuth | No |
| GET | `/api/auth/kick-callback` | Kick OAuth callback handler | No |
| POST | `/api/auth/store-tokens` | Store OAuth tokens | No |
| GET | `/api/auth/kick-bot` | Redirect to Kick OAuth for bot | No |
| GET | `/api/auth/kick-bot-callback` | Kick OAuth callback for bot | No |
| GET | `/api/auth/discord` | Redirect to Discord OAuth | Yes |
| GET | `/api/auth/discord/callback` | Discord OAuth callback | No |
| POST | `/api/auth/discord/link` | Manually link Discord account | Yes |
| POST | `/api/auth/discord/unlink` | Unlink Discord account | Yes |
| GET | `/api/auth/cookie-status` | Debug cookie status | No |

---

### **User Routes** (`/api/usuarios`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/usuarios/me` | Get current user profile | Yes |
| PUT | `/api/usuarios/me` | Update current user profile | Yes |
| POST | `/api/usuarios/sync-kick-info` | Sync Kick user info (avatar, username) | Yes |
| GET | `/api/usuarios` | List all users (admin) | Yes + `ver_usuarios` |
| GET | `/api/usuarios/:usuarioId/canjes` | Get redemptions for specific user | Yes + `gestionar_canjes` |
| PUT | `/api/usuarios/:id/puntos` | Update user points (admin) | Yes + `editar_puntos` |
| GET | `/api/usuarios/debug/roles-permisos` | Debug roles and permissions structure | No |

---

### **Product Routes** (`/api/productos`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/productos` | List all products (public) | No |
| GET | `/api/productos/debug/all` | Debug endpoint - list all products | No |
| GET | `/api/productos/admin` | List products with admin details | Yes + `gestionar_canjes` |
| GET | `/api/productos/slug/:slug` | Get product by slug (optional auth) | Optional |
| GET | `/api/productos/:id` | Get product by ID | No |
| POST | `/api/productos` | Create new product | Yes + `crear_producto` |
| PUT | `/api/productos/:id` | Update product | Yes + `editar_producto` |
| PUT | `/api/productos/:id/promociones` | Update product promotions | Yes + `editar_producto` |
| DELETE | `/api/productos/:id` | Delete product | Yes + `eliminar_producto` |

---

### **Redemption/Canje Routes** (`/api/canjes`) ⭐
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/canjes` | **Create new redemption** | Yes + `canjear_productos` |
| GET | `/api/canjes/mios` | Get current user's redemptions | Yes + `ver_canjes` |
| GET | `/api/canjes/usuario/:usuarioId` | Get redemptions for specific user | Yes + `gestionar_canjes` |
| GET | `/api/canjes` | List all redemptions (admin) | Yes + `gestionar_canjes` |
| PUT | `/api/canjes/:id` | Update redemption status | Yes + `gestionar_canjes` |
| PUT | `/api/canjes/:id/devolver` | Return redemption (refund points) | Yes + `gestionar_canjes` |

---

### **Points History Routes** (`/api/historial-puntos`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/historial-puntos/:usuarioId` | Get user points history (filtered) | Yes + `ver_historial_puntos` |
| GET | `/api/historial-puntos/:usuarioId/completo` | Get complete points history (incl. chat events) | Yes + `editar_puntos` |

---

### **Kick Webhook Routes** (`/api/kick-webhook`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| POST | `/api/kick-webhook/events` | Handle Kick webhook events | No (webhook CORS) |
| GET | `/api/kick-webhook/events` | Webhook verification endpoint | No (webhook CORS) |
| GET | `/api/kick-webhook/debug-stream-status` | Debug stream status | No |
| POST | `/api/kick-webhook/debug/force-stream-state` | Force stream state (debug) | No |
| GET | `/api/kick-webhook/public/points-config` | Get public points configuration | No |

---

### **Kick Subscription Routes** (`/api/kick`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/kick/subscriptions` | Get Kick event subscriptions | Yes + `ver_usuarios` |
| POST | `/api/kick/subscriptions` | Create Kick event subscriptions | Yes + `gestionar_usuarios` |
| DELETE | `/api/kick/subscriptions` | Delete Kick event subscriptions | Yes + `gestionar_usuarios` |
| GET | `/api/kick/local-subscriptions` | Get local stored subscriptions | Yes + `ver_usuarios` |

---

### **Kick Points Config Routes** (`/api/kick`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| PUT | `/api/kick/points-config` | Update points configuration | Yes + `editar_puntos` |
| PUT | `/api/kick/points-config/bulk` | Update multiple point configs | Yes + `editar_puntos` |
| POST | `/api/kick/points-config/initialize` | Initialize points configuration | Yes + `editar_puntos` |
| GET | `/api/kick/points-config` | Get points configuration (public) | No |

---

### **Kick Broadcaster Routes** (`/api/kick`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/kick/broadcaster/status` | Get broadcaster connection status | Yes + `ver_usuarios` |
| POST | `/api/kick/broadcaster/disconnect` | Disconnect broadcaster | Yes + `gestionar_usuarios` |
| GET | `/api/kick/broadcaster/token` | Get active broadcaster token | Yes + `gestionar_usuarios` |
| POST | `/api/kick/broadcaster/refresh-token` | Refresh broadcaster token | Yes + `gestionar_usuarios` |
| GET | `/api/kick/broadcaster/refresh-service/status` | Get token refresh service status | Yes + `ver_usuarios` |
| GET | `/api/kick/broadcaster/debug` | Debug broadcaster config | Yes + `editar_puntos` |

---

### **Kick Admin Routes** (`/api/kick-admin`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/kick-admin/config` | Get migration and VIP configuration | Yes + `gestionar_usuarios` |
| PUT | `/api/kick-admin/migration` | Enable/disable Botrix migration | Yes + `gestionar_usuarios` |
| PUT | `/api/kick-admin/vip-config` | Update VIP points configuration | Yes + `gestionar_usuarios` |
| PUT | `/api/kick-admin/watchtime-migration` | Enable/disable Botrix watchtime migration | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/canje/:canjeId/grant-vip` | Grant VIP from delivered redemption | Yes + `gestionar_canjes` |
| POST | `/api/kick-admin/usuario/:usuarioId/vip` | Grant VIP manually to user | Yes + `gestionar_usuarios` |
| DELETE | `/api/kick-admin/usuario/:usuarioId/vip` | Remove VIP from user | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/cleanup-expired-vips` | Clean up expired VIPs | Yes + `gestionar_usuarios` |
| GET | `/api/kick-admin/users` | Get users with VIP and migration details | Yes + `ver_usuarios` |
| POST | `/api/kick-admin/manual-migration` | Manual points migration (testing) | Yes + `gestionar_usuarios` |
| GET | `/api/kick-admin/bot-maintenance/status` | Get bot maintenance service status | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/bot-maintenance/start` | Start bot maintenance service | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/bot-maintenance/stop` | Stop bot maintenance service | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/bot-maintenance/trigger` | Trigger maintenance manually | Yes + `gestionar_usuarios` |
| GET | `/api/kick-admin/bot-tokens` | Get all bot tokens status | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/bot-tokens/cleanup` | Clean up expired bot tokens | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/bot-tokens/:tokenId/refresh` | Refresh specific bot token | Yes + `gestionar_usuarios` |
| DELETE | `/api/kick-admin/bot-tokens/:tokenId` | Deactivate specific bot token | Yes + `gestionar_usuarios` |
| POST | `/api/kick-admin/bot-test-message` | Test sending bot message | Yes + `gestionar_usuarios` |

---

### **Kick Bot Commands Routes** (`/api/kick-admin/bot-commands`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/kick-admin/bot-commands/public` | Get all bot commands (public) | No |
| GET | `/api/kick-admin/bot-commands/stats` | Get bot commands statistics | Yes + `editar_puntos` |
| POST | `/api/kick-admin/bot-commands/test` | Test a command without saving | Yes + `editar_puntos` |
| GET | `/api/kick-admin/bot-commands` | Get all bot commands (admin) | Yes + `editar_puntos` |
| GET | `/api/kick-admin/bot-commands/:id` | Get specific bot command | Yes + `editar_puntos` |
| POST | `/api/kick-admin/bot-commands` | Create new bot command | Yes + `editar_puntos` |
| PUT | `/api/kick-admin/bot-commands/:id` | Update bot command | Yes + `editar_puntos` |
| PATCH | `/api/kick-admin/bot-commands/:id/toggle` | Toggle command enabled/disabled | Yes + `editar_puntos` |
| POST | `/api/kick-admin/bot-commands/:id/duplicate` | Duplicate bot command | Yes + `editar_puntos` |
| DELETE | `/api/kick-admin/bot-commands/:id` | Delete bot command | Yes + `editar_puntos` |

---

### **Leaderboard Routes** (`/api/leaderboard`) ⭐
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/leaderboard` | Get complete leaderboard with position changes | No |
| GET | `/api/leaderboard/top10` | Get top 10 leaderboard (optimized) | No |
| GET | `/api/leaderboard/stats` | Get leaderboard statistics | No |
| GET | `/api/leaderboard/user/:userId/history` | Get position history for user | No |
| GET | `/api/leaderboard/me` | Get current user's position | Yes |
| POST | `/api/leaderboard/snapshot` | Create manual leaderboard snapshot | Yes + `gestionar_usuarios` |
| DELETE | `/api/leaderboard/snapshots/old` | Clean old leaderboard snapshots | Yes + `gestionar_usuarios` |

---

### **Promotions Routes** (`/api/promociones`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/promociones/activas` | Get all active promotions (public) | No |
| POST | `/api/promociones/validar-codigo` | Validate promotion code | Optional auth |
| GET | `/api/promociones` | List all promotions with filters | Yes + `gestionar_productos` |
| POST | `/api/promociones` | Create new promotion | Yes + `gestionar_productos` |
| GET | `/api/promociones/exportar-pdf` | Export promotions to PDF | Yes + `gestionar_productos` |
| PUT | `/api/promociones/actualizar-estados` | Manually update promotion states | Yes + `gestionar_productos` |
| GET | `/api/promociones/producto/:productoId` | Get promotions for specific product | Yes + `gestionar_productos` |
| GET | `/api/promociones/:id` | Get specific promotion | Yes + `gestionar_productos` |
| PUT | `/api/promociones/:id` | Update promotion | Yes + `gestionar_productos` |
| DELETE | `/api/promociones/:id` | Delete promotion (soft delete) | Yes + `gestionar_productos` |
| DELETE | `/api/promociones/:id/permanente` | Permanently delete promotion | Yes + `gestionar_productos` |
| GET | `/api/promociones/:id/estadisticas` | Get promotion statistics | Yes + `gestionar_productos` |
| POST | `/api/promociones/:promocionId/productos` | Assign products to promotion | Yes + `gestionar_productos` |
| DELETE | `/api/promociones/:promocionId/productos/:productoId` | Unassign product from promotion | Yes + `gestionar_productos` |

---

### **Broadcaster Info Routes** (`/api/broadcaster`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/broadcaster/info` | Get complete broadcaster info (stream status, metadata, uptime) | No |
| GET | `/api/broadcaster/status` | Get stream status only (online/offline) | No |

---

### **Notifications Routes** (`/api/notificaciones`)
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/api/notificaciones` | List user notifications (paginated) | Yes |
| GET | `/api/notificaciones/no-leidas/contar` | Count unread notifications | Yes |
| GET | `/api/notificaciones/:id` | Get notification detail (marks as read) | Yes |
| PATCH | `/api/notificaciones/:id/leido` | Mark notification as read | Yes |
| PATCH | `/api/notificaciones/leer-todas` | Mark all notifications as read | Yes |
| DELETE | `/api/notificaciones/:id` | Delete notification (soft delete) | Yes |

---

### **Static Files**
| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | `/assets/*` | Serve static files from assets folder | No |

---

## Summary

**Total Endpoints: 89**

**Key Endpoints You Requested:**
- **Canje/Redemption**: `POST /api/canjes` (requires auth + `canjear_productos` permission)
- **Products**: Full CRUD at `/api/productos` with admin endpoints
- **Auth**: Complete OAuth flow for Kick and Discord, plus local auth
- **Leaderboard**: Public read endpoints at `/api/leaderboard`

**Authentication Levels:**
- **No auth**: Public endpoints (products, leaderboard, broadcaster info, webhooks)
- **Optional auth**: Some endpoints work with or without auth
- **Auth required**: User-specific endpoints
- **Auth + specific permission**: Admin/management endpoints (using `permiso` middleware)

**Permission Types Used:**
- `ver_usuarios` - View users
- `gestionar_usuarios` - Manage users
- `gestionar_canjes` - Manage redemptions
- `canjear_productos` - Redeem products
- `ver_canjes` - View redemptions
- `editar_puntos` - Edit points
- `crear_producto` - Create products
- `editar_producto` - Edit products
- `eliminar_producto` - Delete products
- `ver_historial_puntos` - View points history
- `gestionar_productos` - Manage products