# Backend Changes — Luisardito v2

Everything the **external API server** (the separate Node/Express backend, not this repo) needs to provide or change so the v2 frontend works fully. Items are grouped by priority.

> Frontend repo = `luisardito-frontend` (this repo, Next.js 16).
> Backend = the API server reached via `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`).
> Legacy reference = `luisardito-shop-frontend` (Pages Router, being replaced).

---

## P0 — Required for current frontend to function

### 1. Product image dimensions — FRONTEND-ONLY, no backend change
**Why:** The shop feed uses a masonry layout (CSS columns + `break-inside-avoid`). Each card needs its real aspect ratio so the frame matches the image, exactly like recent.design does it. Right now the v2 frontend cycles through 8 fake ratios by index, which crops images wrong.

**Already solved by the architecture — nothing for the backend to do:**
- The frontend uploads directly to Cloudinary (unsigned preset, no backend involvement, no Cloudinary creds on the backend).
- Cloudinary's upload response **already includes `width` and `height`** (see `CloudinaryUploadResult` with `[key: string]: any` in the legacy `utils/cloudinary.ts`).
- The backend **already accepts** `imagen_width` / `imagen_height` in the `POST /api/productos` and `PUT /api/productos/:id` body.
- The legacy frontend just throws the dimensions away (`ImageUpload.tsx` only passes `onChange(url)`).

**What actually needs to happen (all frontend, in the v2 repo):**
1. When the v2 admin product form is built, the `ImageUpload` component must capture `res.width` / `res.height` from the Cloudinary response and pass them up alongside the URL.
2. The product form must include `imagen_width` / `imagen_height` in the POST/PUT body.
3. Add `imagen_width?: number` and `imagen_height?: number` to the `Producto` type in `src/types/index.ts`.
4. In `src/lib/product-mapper.ts`, when both dimensions exist, set `aspect` to the real ratio (inline `style={{ aspectRatio: \`${w} / ${h}\` }}` for non-integer ratios). Otherwise keep the cycled fallback.
5. Backfill: re-save the ~3 existing products from the admin panel once the frontend sends dimensions. That's it.

**Backend action: none.** Just confirm `imagen_width` / `imagen_height` are returned in the product GET responses (they should be, if the columns exist and are populated). If the columns don't exist yet on the product table, that's a one-time migration (`ALTER TABLE productos ADD COLUMN imagen_width INT, ADD COLUMN imagen_height INT`) — but the create/edit endpoints already accept the fields per the legacy code.

---

### 2. Last redeemer on product (`ultimo_canje`) — RESOLVED (backend PR #72, merged)
**Why:** The redesigned product card shows a bottom-left avatar representing the last person who redeemed (canjeó) the product.

**Status:** Backend PR #72 already implemented and merged. `ultimo_canje` is exposed on:
- `GET /api/productos`
- `GET /api/productos/admin`
- `GET /api/productos/:id`
- `GET /api/productos/slug/:slug`

Response shape (verified against running local API):
```json
"ultimo_canje": {
  "usuario_id": 3,
  "nickname": "NaferJ",
  "display_name": "NaferJ",
  "avatar": null,
  "kick_data": { "avatar_url": null, "username": null },
  "fecha": "2026-09-05T01:04:17Z"
} | null
```

Selects most recent redemption with `estado IN ('pendiente', 'entregado')` — cancelled/returned excluded. `null` when never redeemed.

**Frontend side:** Already wired — `product-mapper.ts` maps `ultimo_canje` → `lastRedeemer`, `DesignCard` renders the avatar when present, falls back to colored dot when `avatar` is null.

---

### 3. Verify `/api/leaderboard` returns the fields the v2 frontend expects
**Why:** The new `LeaderboardAside` widget (top 5 in the shop sidebar) expects a specific shape. The endpoint already exists (legacy uses it), but the v2 type is stricter.

**Expected response** (`GET /api/leaderboard?limit=5`, public, no auth):
```json
{
  "data": [
    {
      "usuario_id": 1,
      "nickname": "user",
      "puntos": 5000,
      "position": 1,
      "position_change": 0,
      "change_indicator": "up" | "down" | "neutral" | "new",
      "previous_position": 2 | null,
      "previous_points": 4800 | null,
      "is_vip": true,
      "is_subscriber": false,
      "kick_data": { "avatar_url": "...", "username": "..." } | null
    }
  ]
}
```

**Action:** Confirm the existing endpoint returns all these fields. If any are missing (likely `position_change`, `change_indicator`, `previous_position`, `previous_points`), add them. The frontend already degrades gracefully (returns `[]` on error), but the widget looks empty without data.

---

### 4. CORS for the new domains
**Why:** The v2 frontend will run on `luisardito.com` and `shop.luisardito.com` (and locally on `localhost:3000`). The backend must allow these origins.

**Change:**
- Add to CORS allowlist:
  - `https://luisardito.com`
  - `https://www.luisardito.com`
  - `https://shop.luisardito.com`
  - `http://localhost:3000` (dev)
- Keep whatever legacy origins are already allowed.

---

## P1 — Needed soon (frontend already calls or will call these)

### 5. Confirm canje creation endpoint works for v2 (`POST /api/canjes`)
**Why:** The v2 product detail overlay calls `/shop/api/redeem` (a Next.js route handler in this repo) which will proxy to the backend's `POST /api/canjes` with `{ producto_id }`. The legacy uses the same endpoint, so it likely already works.

**Action:**
- Confirm `POST /api/canjes` accepts `{ producto_id: number }` with auth, returns the created canje, and handles insufficient points / out-of-stock errors with clear messages.
- **Frontend side (this repo):** Create `src/app/shop/api/redeem/route.ts` that proxies to `POST /api/canjes`. This file does **not** exist yet — the overlay calls it but gets a 404 today.

---

### 6. Bookmark / saved products (if we want persistence)
**Why:** The redesigned card has a bookmark button. Right now it only stops propagation (does nothing). If we want saved products to persist across sessions, the backend needs to store them.

**Options (pick one):**
- **a) New endpoints:**
  - `POST /api/usuarios/me/saved-products` with `{ producto_id }` — save
  - `DELETE /api/usuarios/me/saved-products/:producto_id` — unsave
  - `GET /api/usuarios/me/saved-products` — list
- **b) Skip persistence:** keep the bookmark as a UI-only client-side state (localStorage). No backend change. Simpler, but saved items don't sync across devices.

**Recommendation:** Start with (b) for v2 launch, add (a) later if users want it.

---

## P2 — Nice to have / future

### 7. Status page (`status.luisardito.com`)
**Why:** The plan includes a status page.

**Options:**
- **a) Third-party service** (BetterStack, UptimeRobot, etc.) — no backend change, just DNS + a CNAME. Recommended for simplicity.
- **b) Self-hosted:** backend exposes `GET /api/status` returning service health (DB, Kick API, points engine). The status page (separate frontend or a route here) polls it. More work, more control.

**Recommendation:** Use a third-party status service. Don't build this unless there's a specific reason.

---

### 8. Changelog (`/changelog`)
**Why:** The plan includes a `/changelog` route for version history.

**This is frontend-only.** No backend change needed. The route reads from a markdown file or a static JSON in this repo. The only backend involvement would be if you want changelog entries managed from an admin panel — not needed for v2.

---

### 9. i18n (Spanish / English)
**Why:** The plan includes bilingual support.

**This is frontend-only.** No backend change needed for the shop UI strings. The only backend consideration: if product names/descriptions should be translatable, the product schema would need localized fields. Not needed for v2 launch — ship Spanish first.

---

## Summary table

| # | Change | Where | Priority | Effort |
|---|--------|-------|----------|--------|
| 1 | Product image dimensions | Frontend-only (Cloudinary already returns them) | P0 | Small |
| 2 | Last redeemer on product | Backend | P0 | Small |
| 3 | Verify leaderboard fields | Backend | P0 | Trivial |
| 4 | CORS for new domains | Backend | P0 | Trivial |
| 5 | Confirm canje creation + create `/shop/api/redeem` proxy | Backend (verify) + Frontend (create route) | P1 | Small |
| 6 | Bookmark persistence | Backend (if option a) | P1 | Medium |
| 7 | Status page | External service (recommended) | P2 | Trivial |
| 8 | Changelog route | Frontend only | P2 | Small |
| 9 | i18n | Frontend only | P2 | Medium |

---

## Notes for the backend agent

- The backend repo is **not** in this workspace. It's the API server reached via `NEXT_PUBLIC_API_URL`.
- All new product fields must be **optional** in the response so the frontend doesn't break during rollout.
- The frontend already has graceful fallbacks for missing data (cycled ratios, colored avatar dot, empty leaderboard). Nothing should crash if a field is absent.
- Naming: the existing API uses Spanish-ish field names (`nombre`, `precio`, `created_at`). New fields can follow either convention as long as the frontend type matches. Recommend `imagen_width` / `imagen_height` (consistent with `imagen_url`) and `ultimo_canje` (consistent with `canjes_count`).

---

## Subscriber badge — backend gaps (frontend issue #5)

The frontend has a scalable subscriber badge system (`src/lib/subscriber-tiers.ts` +
`src/components/subscriber-badge.tsx`) that maps `subscription_duration_months` to
tiered badge images. The leaderboard endpoint already exposes the field (backend #74,
shipped). The following gaps remain:

### Gap 1 — `subscription_duration_months` on user endpoints (backend #78, resolved)

`GET /api/usuarios/me`, `GET /api/usuarios`, and `GET /api/kick-admin/users` now
include `subscription_duration_months` on `subscriber_status`. Backend PR #79
merged; frontend types and rendering are ready.

**CONFIRMED:** `subscription_duration_months` is simply how many months the
user has been subscribed (accumulated, from Kick's `duration` field). The
frontend tier mapping is 1 month → tier 1, 2 months → tier 2, 3 months →
tier 3, 4 months → tier 4, 5 months → tier 5, 6+ months → tier 6 (capped).

**Edge case:** Gifted subscriptions (`channel.subscription.gifts`) do not
include a duration field. A user known only through a gift can have
`is_subscriber: true` with `subscription_duration_months: null`. The
frontend `SubscriberBadge` handles this by returning `null` (no badge)
when duration is null — correct behavior.

### Gap 2 — VIP status on user endpoint (RESOLVED, no backend change needed)

`GET /api/usuarios/me` already returns `vip_status: { is_active, is_permanent,
expires_soon, expires_at }`. The frontend was checking `vip_info?.is_active ??
user.is_vip` and missing `vip_status`. Fixed in the frontend — AccountPill,
profile view, and admin canjes list now check `vip_status?.is_active` first,
then fall back to `vip_info` and `is_vip`.

### Gap 3 — `canjes.controller.ts` subscriber_status (out of scope for #78)

The redemption history endpoint still builds `subscriber_status` with the old
2-field shape. If the frontend needs the badge on redemption history views,
that's a separate issue.

---

## My redemptions pagination (backend #80, resolved; backend PR #81 merged)

The Canjes redesign uses the new paginated `GET /api/canjes/mios` response:

```ts
{
  data: Canje[]
  pagination: { total: number; limit: number; offset: number; has_more: boolean }
  summary: {
    total: number
    total_points: number
    by_status: {
      pendiente: number
      entregado: number
      cancelado: number
      devuelto: number
    }
  }
}
```

Supported query parameters are `limit` (1–100), `offset`, `estado`, and
`sort` (`date-desc` / `date-asc`). The frontend uses 10 items per page and
stores status, sort, and page in the URL so navigation is reload-safe and
shareable. The summary is intentionally read from the backend because it
represents the complete history, not just the current page.

Backend issue #80 is assigned to NaferJ and currently In Progress on the
backend board. The backend branch is `feat/canjes-server-pagination`; its old
`feat/subscription-duration-on-user-endpoints` branch is safe to delete after
explicit confirmation.
