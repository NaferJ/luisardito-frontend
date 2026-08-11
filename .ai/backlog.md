# Backlog — Luisardito Frontend

Prioritized list of upcoming work. Update this file as items are completed or new ones are identified.

## In progress

- Landing page — design and build the main landing page (next session, new branch from `main`).

## Up next

- Port logic from `luisardito-shop-frontend` — copy the shop/business logic from the sibling project into this template. This happens after the landing page is done.

## Backlog

- Clean up unused CSS keyframe animations in `globals.css` — leftover from previous CSS-based decoration attempts (`shimmer-wave`, `shimmer-wave-slow`, `shine-sweep`, `band-pulse` and their `.animate-*` classes). No longer used by `SideDecor` but still in the file.
- Theme toggle (light/dark switch) — currently relies on system `prefers-color-scheme` only, no manual toggle for users.
- Test framework setup — no test framework is configured yet. When added, update `.devin/rules/luisardito-frontend.md` testing section.
- `.env.example` — create with safe placeholders if env vars are introduced.
