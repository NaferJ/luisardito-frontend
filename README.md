# Luisardito Frontend

Next.js 16 App Router frontend for Luisardito, including the public site, points-redemption shop, authenticated account pages, and admin interfaces. The application uses React 19, strict TypeScript, Tailwind CSS v4, and a small set of route handlers that proxy authentication or protected backend operations.

The separate `luisardito-shop-backend` service owns the API, database, authentication state, and business logic. Do not duplicate backend behavior in this repository.

## Requirements

- Node.js 20 or later
- npm
- The backend running locally on `http://localhost:3001` for full shop functionality

## Local setup

Install exactly the dependencies recorded in the lock file:

```bash
npm ci
```

Copy `.env.example` to `.env` and replace the safe placeholders with values for your environment. All frontend environment variables are prefixed with `NEXT_PUBLIC_` and are bundled into the client where used.

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`. The shop is available under `/shop`; production also maps `shop.luisardito.com` to that route tree.

## Project structure

- `src/app/` — routes, layouts, server actions, and thin route handlers
- `src/components/` — shared, shop, and admin UI
- `src/lib/` — API clients, authentication, data mapping, and utilities
- `src/types/` — backend response and application types
- `src/content/changelog/` — typed release notes
- `.ai/` — project context and historical implementation notes

## Commands

- `npm run dev` — run the development server
- `npm run lint` — run ESLint
- `npm run build` — create a production build
- `npm run start` — serve the production build

There is currently no automated test framework. Before opening a pull request, run:

```bash
npm ci
npm run lint
npm run build
```

On Windows, use `npm ci` for routine installs. Follow the cross-platform lock-file instructions in `AGENTS.md` when dependencies must be added or updated.

## Deployment

The frontend deploys to Vercel. Environment variables and pre-deployment checks are documented in `.env.example` and `.ai/deploy-checklist.md`.
