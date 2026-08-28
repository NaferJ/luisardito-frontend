# Luisardito Frontend — Handoff

## Stack
- Next.js 16 (App Router) + React 19 + Tailwind CSS v4, strict TypeScript, ESLint 9, deployed on Vercel.
- Read .ai/principles.md and .devin/rules/luisardito-frontend.md before starting.
- Backend repo: `C:\Users\NaferJ\Projects\Private\luisardito-shop-backend` (read-only, do not modify).

## Current version
- v2.0.0 (lint + build green, 35 routes).

## What was done this session

- **Kick logo fix.** Replaced the mangled SVG path in `src/components/brand-icons.tsx` with the official Kick brand logo path from simple-icons. The `KickLogo` component is used on the profile page, admin users, admin canjes, and kick config.
- **Leaderboard rebuild (`/shop/leaderboard`).** Replaced the grid table with the clean `/jobs` list pattern (alternating rows, rounded container, avatar + name + points). Added: stats header (from previously-unused `/api/leaderboard/stats` endpoint), reset countdown banner (from previously-discarded `meta.days_until_reset`), pinned "my position" at bottom with `...` divider when outside the loaded list, "Load more" pagination (25 initial, 25 increment via offset param). Created `src/lib/public-api.ts` — client-safe fetch for public API endpoints (doesn't import `next/headers`, safe inside Client Components).
- **Admin promotions (`/shop/admin/promociones`) — full rebuild.** Data-shape audit found NO mismatches (unlike canjes/usuarios). Rebuilt list with: stats cards (Total/Active/Scheduled/Expired/Paused), estado filter pills, date range filter, sortable columns, pagination (10/20/50), CSV export, detail drawer (overlay-style, slides from left, prev/next keyboard nav) with live statistics from `/api/promociones/:id/estadisticas` (total uses, unique users, avg discount, points saved, top users, top products), linked products list, usage progress bar, LIVE/SOON badges. Added `fetchPromocionEstadisticas` server action (auth-required endpoint can't be fetched client-side due to `next/headers` chain).
- **Admin commands (`/shop/admin/comandos`) — full rebuild.** Data-shape audit found mismatches: `auto_send_interval_seconds` missing from frontend type, `dynamic_handler` missing from form, `description`/`dynamic_handler`/`last_used_at` should accept `null`. Fixed all. Rebuilt list with: stats cards (Total/Enabled/Disabled/Simple/Dynamic), type filter pills + status select, search, sortable columns, pagination, CSV export, detail drawer with prev/next keyboard nav, optimistic toggle updates, inline create/edit form with new `dynamic_handler` and `auto_send_interval_seconds` fields.
- **Navigation review + fixes.** Fixed sidebar active states — every nav section used exact-match comparison (`pathname === link.href`), so sub-routes never highlighted their parent. Added `getActiveHref()` helper with prefix-segment matching (longest-match-wins). Now `/shop/admin/promociones/new` correctly highlights "Promotions", `/shop/admin/usuarios/[id]` highlights "Users", etc. No dead links found. Breadcrumbs consistent across all admin sub-pages.
- **Version bump to 2.0.0.** Updated `package.json` version from `0.1.0` to `2.0.0`. Created `src/content/changelog/v2.0.0.md` with Added/Fixed/Changed sections covering all work.

## Previous session work (still relevant)

- **Admin redemptions (`/shop/admin/canjes`) — full rebuild.** Fixed Sequelize capitalization bug (`Usuario`/`Producto` not `usuario`/`producto`). Added: detail drawer, pending count badge in sidebar nav, bulk selection + bulk deliver/cancel, real-time polling (30s), CSV export, date range filter, optimistic updates, sortable columns, pagination (10/20/50), Discord info with "No Discord" warnings.
- **Admin users (`/shop/admin/usuarios`) — full rebuild.** Fixed three backend contract bugs: (1) backend sends `vip_status` not `vip_info`, (2) points action must send `operation` not `modo` and `motivo` is required, (3) no single-user endpoint exists so `getUsuarioById` now filters from the list. Rebuilt list with stats cards, role filter pills, date range filter, sortable columns, pagination, CSV export, detail drawer.
- **User-facing canjes page** — fixed same `Producto`/`Usuario` capitalization bug.

## Open items (do these first)

1. **Bot commands public endpoint is broken.** `GET /api/kick-admin/bot-commands/public` returns `{"error":"Token not provided"}` — the backend is applying auth middleware to the public route. The route file (`luisardito-shop-backend/src/routes/kickBotCommands.routes.ts`) has `router.get("/public", ...)` before `router.use(authRequired)`, so it *should* be public, but something is intercepting it. This is a **backend bug**, not a frontend bug. The frontend code in `src/lib/comandos.ts` and `src/components/shop/comandos-table.tsx` is correct. Needs backend investigation — possibly a global auth middleware or route ordering issue in `app.ts`.

## Backlog (next up)

1. **Visual review all pages with real data** — verify every admin and customer page renders correctly with live backend data. Requires running the dev server (user must do this).
2. **Deploy** — configure `shop.luisardito.com`, tag v2.0.0.
3. **i18n** — Spanish/English internationalization (post-v2).
4. **Status page** — `status.luisardito.com` (post-v2).
5. **Ideaboard** — `/ideaboard` community feature board (post-v2).

## Blockers / notes

- **Backend `Usuario`/`Producto` associations are capitalized.** Sequelize `belongsTo` without explicit `as` defaults to the model name. All frontend types now include both `Usuario`/`usuario` and `Producto`/`producto` as optional fields. Always check `c.Usuario ?? c.usuario` and `c.Producto ?? c.producto`.
- **Backend users list sends `vip_status`, not `vip_info`.** The `AdminUsuario` type in `src/lib/admin.ts` now includes both. Always check `u.vip_status ?? u.vip_info`.
- **No `GET /api/usuarios/:id` endpoint exists.** `getUsuarioById` fetches the full list and filters. This is acceptable for now but could be slow with many users.
- **Points update action requires `motivo`.** The backend rejects empty reasons. The frontend now validates this before submitting.
- **Detail drawers must be rendered outside any CSS-transformed parent.** `position: fixed` inside a `translate-x` element is relative to the transformed parent, not the viewport. The canjes, usuarios, promociones, and comandos components all render the drawer as a sibling outside the shifting div.
- **Pending badge event system.** `PendingCanjesBadge` listens for a `CANJES_STATUS_CHANGED` custom DOM event. The canjes list dispatches it on every status change. If other admin pages need to refresh the badge, dispatch `window.dispatchEvent(new Event(CANJES_STATUS_CHANGED))` after mutations.
- **Client components cannot import `@/lib/admin`, `@/lib/api`, or `@/lib/cookies`.** These chain to `next/headers` which is server-only. For client-side authed fetches, use server actions (like `fetchPromocionEstadisticas` in `promociones/actions.ts`). For client-side public fetches, use `@/lib/public-api.ts`.
- **Promotions data-shape is clean.** The `productos` association uses lowercase consistently. The statistics endpoint uses capitalized `Usuario`/`Producto` which matches the frontend types. No mismatches.
- **Commands data-shape fixed.** `auto_send_interval_seconds` added to frontend types. `dynamic_handler` added to form. `description`/`dynamic_handler`/`last_used_at` now accept `null`.
- **Do NOT run `npm run dev`** — the user runs the dev server. Only run `npm run lint` and `npm run build` for verification.
- **Do NOT commit or push** — only the user does that.
