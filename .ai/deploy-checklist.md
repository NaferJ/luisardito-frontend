# Deploy Checklist — Luisardito Frontend (Vercel)

This repo deploys on Vercel (not Docker). Below is everything needed to go live.

---

## 1. Vercel project setup

- [ ] Go to [vercel.com](https://vercel.com) and create a new project from the `luisardito-frontend` GitHub repo.
- [ ] Framework preset: Next.js (auto-detected).
- [ ] Build command: `npm run build` (auto-detected).
- [ ] Output directory: `.next` (auto-detected).
- [ ] Install command: `npm ci` (auto-detected).
- [ ] Node.js version: 20 (set in Project Settings > General > Node.js Version).

## 2. Environment variables on Vercel

Set these in Project Settings > Environment Variables. Create them for the
**Production** environment (and **Preview** if you want preview deploys to
work). All vars are `NEXT_PUBLIC_` so they are inlined at build time.

### Required (actively used by the code)

| Variable | Example production value | Used in |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://api.luisardito.com` | `lib/api.ts`, `lib/public-api.ts`, `proxy.ts`, `lib/kick-auth.ts` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | `components/admin/image-upload.tsx` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `your_upload_preset` | `components/admin/image-upload.tsx` |

### Optional (carried over from legacy, not actively read by current code)

| Variable | Example value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_TIMEOUT` | `10000` | API request timeout in ms |
| `NEXT_PUBLIC_APP_NAME` | `Luisardito` | App display name |
| `NEXT_PUBLIC_APP_VERSION` | `2.0.0` | App version string |
| `NEXT_PUBLIC_ENABLE_DEBUG` | `false` | Enable debug logging |
| `NEXT_PUBLIC_KICK_CLIENT_ID` | `your_kick_client_id` | Kick OAuth client ID |
| `NEXT_PUBLIC_REDIRECT_URI` | `https://shop.luisardito.com/auth/callback` | Kick OAuth redirect URI |
| `NEXT_PUBLIC_KICK_OAUTH_URL` | `https://id.kick.com/oauth/authorize` | Kick OAuth authorize endpoint |
| `NEXT_PUBLIC_KICK_TOKEN_URL` | `https://id.kick.com/oauth/token` | Kick token endpoint |
| `NEXT_PUBLIC_KICK_USER_URL` | `https://api.kick.com/public/v1/users` | Kick user profile endpoint |
| `NEXT_PUBLIC_KICK_SCOPE` | `user:read events:subscribe kicks:read` | Kick OAuth scopes |

### Vercel built-in (do NOT set manually)

- `NEXT_PUBLIC_VERCEL_URL` — automatically provided by Vercel. Used in
  `lib/cookies.ts` to detect localhost vs production.

## 3. Custom domain setup

Add custom domains in Vercel Project Settings > Domains:

- [ ] `luisardito.com` — primary domain (main site).
- [ ] `www.luisardito.com` — redirect to `luisardito.com` (optional, Vercel
      handles this automatically).
- [ ] `shop.luisardito.com` — shop subdomain. The `next.config.mjs` host-based
      rewrite maps `shop.luisardito.com/:path*` to `/shop/:path*` internally.
      No `vercel.json` needed — the Next.js rewrite works on Vercel.

DNS records to configure (at your DNS provider):

| Host | Type | Value |
|---|---|---|
| `luisardito.com` | A | `76.76.21.21` (Vercel) |
| `www.luisardito.com` | CNAME | `cname.vercel-dns.com` |
| `shop.luisardito.com` | CNAME | `cname.vercel-dns.com` |

(Vercel will show the exact DNS records to add after you add the domains.)

## 4. Backend changes needed

The backend repo (`luisardito-shop-backend`) needs the following env var
updates before the new frontend can go live. **Do not touch the backend code
from this repo** — these are config changes to make on the backend server.

### 4a. FRONTEND_URL (critical)

The backend redirects to `${FRONTEND_URL}/auth/callback` after Kick OAuth,
`${FRONTEND_URL}/perfil` after Discord OAuth, and
`${FRONTEND_URL}/admin/integrations` after Kick Bot OAuth.

The new frontend has these routes under `/shop/`:
- `/shop/auth/callback` (route handler at `src/app/shop/auth/callback/route.ts`)
- `/shop/perfil` (page at `src/app/shop/perfil/page.tsx`)
- `/shop/admin/...` (pages under `src/app/shop/admin/`)

The `next.config.mjs` rewrite maps `shop.luisardito.com/:path*` to
`/shop/:path*`. So if `FRONTEND_URL` is set to `https://shop.luisardito.com`,
the backend redirects resolve correctly:

| Backend redirect | URL | Rewrite target |
|---|---|---|
| `${FRONTEND_URL}/auth/callback` | `https://shop.luisardito.com/auth/callback` | `/shop/auth/callback` |
| `${FRONTEND_URL}/perfil` | `https://shop.luisardito.com/perfil` | `/shop/perfil` |
| `${FRONTEND_URL}/admin/integrations` | `https://shop.luisardito.com/admin/integrations` | `/shop/admin/integrations` |

- [ ] Set `FRONTEND_URL=https://shop.luisardito.com` on the backend (production env).

### 4b. KICK_REDIRECT_URI (verify)

The backend's `KICK_REDIRECT_URI` is the URL Kick redirects to after the user
authorizes. This points to the **backend**, not the frontend:

```
KICK_REDIRECT_URI=https://api.luisardito.com/api/auth/kick-callback
```

- [ ] Verify `KICK_REDIRECT_URI` is set to the backend's production callback URL.
- [ ] Verify this exact URL is registered on the Kick developer portal.

### 4c. KICK_BOT_REDIRECT_URI (verify)

Same pattern for the Kick Bot OAuth flow:

```
KICK_BOT_REDIRECT_URI=https://api.luisardito.com/api/auth/kick-bot-callback
```

- [ ] Verify `KICK_BOT_REDIRECT_URI` is set to the backend's production callback URL.
- [ ] Verify this exact URL is registered on the Kick developer portal.

### 4d. DISCORD_REDIRECT_URI (verify)

```
DISCORD_REDIRECT_URI=https://api.luisardito.com/api/auth/discord/callback
```

- [ ] Verify `DISCORD_REDIRECT_URI` is set to the backend's production callback URL.
- [ ] Verify this exact URL is registered on the Discord developer portal.

### 4e. CORS (already configured)

The backend's CORS middleware (`src/middleware/cors.middleware.ts`) already
allows:

- `https://luisardito.com`
- `https://shop.luisardito.com`
- `https://www.luisardito.com`
- Any origin ending in `.luisardito.com` (wildcard subdomain match)
- Localhost variants for dev

- [ ] No CORS changes needed. Verify the backend is running with `NODE_ENV=production`
      so the cookie domain defaults to `.luisardito.com`.

### 4f. Cookie domain (already configured)

The backend sets cookies with `domain: .luisardito.com` in production
(`src/utils/cookies.util.ts`). This allows cookies to be shared across
`luisardito.com` and `shop.luisardito.com` subdomains.

- [ ] No cookie domain changes needed. Verify `COOKIE_DOMAIN` env var is unset
      (so it defaults to `.luisardito.com`) or set to `.luisardito.com`.

## 5. Pre-deploy verification

Run these locally before deploying:

- [ ] `npm run lint` passes with no errors.
- [ ] `npm run build` passes with no errors.
- [ ] `.env.example` is up to date with all env vars.
- [ ] `.env` is NOT committed (check `.gitignore` — `.env*.local` is excluded;
      consider adding `.env` to `.gitignore` if not already).
- [ ] No real secrets in `.env.example` (only safe placeholders).

## 6. Post-deploy verification

After the first production deploy:

- [ ] `https://luisardito.com` loads the main site.
- [ ] `https://shop.luisardito.com` loads the shop (rewrite to `/shop`).
- [ ] `https://shop.luisardito.com/auth/callback` does not 404 (route exists).
- [ ] Kick OAuth login flow works: clicking login redirects to Kick, back to
      the backend, then to `https://shop.luisardito.com/auth/callback`, sets
      cookies, and redirects to `/shop`.
- [ ] Authenticated pages (`/shop/perfil`, `/shop/canjes`, `/shop/historial`)
      load without redirecting to login when logged in.
- [ ] API calls from the frontend to the backend succeed (no CORS errors in
      browser console).
- [ ] Cloudinary image uploads work from the admin product form.
- [ ] Cookie domain is `.luisardito.com` (check in browser DevTools >
      Application > Cookies).

## 7. CI/CD

- [ ] GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs lint + build
      on every push to `main` and on PRs to `main`.
- [ ] Vercel auto-deploys on push to `main` (production) and on PRs (preview).
- [ ] No Docker build step needed — Vercel handles the build.
