<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Luisardito Frontend

Next.js 16 (App Router) frontend for the Luisardito site. React 19, Tailwind CSS v4, strict TypeScript, ESLint 9, deployed on Vercel. Frontend-only — no API routes, no database, no CMS in this repo. Consumes a separate backend (`luisardito-shop-backend`, read-only).

See `.devin/rules/luisardito-frontend.md` for full code conventions and rules.

## Commands

- `npm run dev` — dev server (the user runs this; AI should not)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm ci` — install dependencies **exactly as locked** (use this locally instead of `npm install`)
- `npm run start` — serve the production build (after `npm run build`)

### Windows / cross-platform lock file note

CI runs on `ubuntu-latest`. Some dependencies have platform-specific optional dependencies. **`npm install` on Windows silently drops the Linux-only optional dependency entries from `package-lock.json`**, which then breaks `npm ci` in CI with `Missing: ... from lock file` errors.

Rules to avoid this:
1. **Never run plain `npm install` on Windows** after the lock file is correct — it rewrites the lock and strips Linux entries. Use `npm ci` for routine local installs instead; it only reads the lock, never rewrites it.
2. **When adding/updating a dependency**, regenerate the lock file in a Linux container so both platforms' optional deps are recorded:
   ```powershell
   docker run --rm -v "${PWD}:/app" -w /app node:22 sh -c "npm install --no-audit --no-fund"
   ```
   Then run `npm ci` locally (Windows) to install from the corrected lock without touching it again.
3. Verify before pushing: `docker run --rm -v "${PWD}:/app" -w /app node:22 sh -c "rm -rf node_modules && npm ci"` should succeed with no errors — this exactly mirrors CI.

## Environment

All env vars are `NEXT_PUBLIC_` (inlined into the client bundle at build time). See `.env.example` for the full list with safe placeholders. Key vars:

- `NEXT_PUBLIC_API_URL` — backend API base URL (default `http://localhost:3001`)
- `NEXT_PUBLIC_API_TIMEOUT` — request timeout in ms (default `10000`)
- `NEXT_PUBLIC_APP_NAME` — display name (default `Luisardito`)
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` / `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` — unsigned image uploads
- Kick OAuth vars are documented for completeness but the actual OAuth flow runs on the backend

On Vercel, set these in Project Settings > Environment Variables. `NEXT_PUBLIC_VERCEL_URL` is provided automatically by Vercel.

## Backend dependency

This frontend consumes the `luisardito-shop-backend` API (running locally on port 3001 via Docker). The backend repo is at `C:\Users\NaferJ\Projects\Private\luisardito-shop-backend` — **read-only, do not modify**. If a data-shape mismatch is found, it is a backend bug and must be fixed there, not worked around silently in the frontend.

## Project Board

The backlog is tracked on the GitHub Projects board: https://github.com/users/NaferJ/projects/12

### Fields

- **Status** — Todo / In Progress / In Review / Done
- **Priority** — High / Medium / Low

Sprint and category are tracked via labels (`feature`, `tooling`, etc.) instead of board fields.

### Workflow

Cards move through the following statuses:

1. **Todo** — Issue created and added to the board, not yet started.
2. **In Progress** — Actively being coded (branch checked out, work underway).
3. **In Review** — PR is open and awaiting review/merge.
4. **Done** — PR merged. PRs that include `Closes #NN` in their description auto-close the referenced issue and move the board card to Done.

### gh CLI commands

Common operations for working with the board:

- View the board:
  `gh project item-list 12 --owner NaferJ`
- Create an issue:
  `gh issue create --repo NaferJ/luisardito-frontend --title "..." --body "..."`
- Add an issue to the board:
  `gh project item-add 12 --owner NaferJ --url <issue-url>`

### Labels

Apply labels to every issue to categorize work. The repo has 13 labels total:

**Custom labels (apply to every issue):**
- `feature` — New feature or UI component
- `ops` — Operations, infra, CI/CD, deployment
- `content` — Content, copy, or asset task (no code changes)
- `tooling` — Developer tooling, workflow, config, monitoring

**GitHub default labels (use when applicable):**
- `bug` — Something isn't working
- `documentation` — Improvements or additions to documentation
- `enhancement` — New feature or request (use `feature` instead for UI work)
- `good first issue` — Good for newcomers
- `help wanted` — Extra attention is needed
- `question` — Further information is requested
- `duplicate` — This issue or pull request already exists
- `invalid` — This doesn't seem right
- `wontfix` — This will not be worked on

### Milestones

Milestones group issues and PRs toward a **release version** (e.g. "v2.1.0"). They are NOT the same as sprints:

- **Sprint** = time box ("what am I working on this cycle")
- **Milestone** = release target ("what version does this ship in")

**Only create a milestone when shipping a version with consumer-visible changes.** Tooling/ops/internal sprints get NO milestone. A milestone is created when you know which issues will ship in the next version bump; when all issues in the milestone are closed, the version is ready to release.

### Card movement rule

When working on an issue, the AI must:
1. Move the card to **In Progress** when starting work (and tell the user)
2. Move the card to **In Review** when a PR is opened (and tell the user)
3. The card moves to **Done** automatically when the PR with `Closes #NN` merges

Always tell the user when moving a card between statuses.

### Status updates

Status updates are high-level project health reports (not task-level updates). Add one via the project board UI (side panel -> Add update).

**When to add a status update:**
- A sprint starts ("Sprint 1 started, target Sep 14")
- A sprint ends ("Sprint 1 complete, 5/6 items done")
- The project is at risk ("Blocked on backend API fix, sprint delayed")
- A major milestone ships ("v2.1.0 released with leaderboard rebuild + admin promotions")

**Cadence for solo work:** one update at sprint start + one at sprint end. Not every session.

Each update has: Status (On track / At risk / Off track), start date, target date, and a brief Markdown message.

### Issue templates

Issue templates exist in `.github/ISSUE_TEMPLATE/`:

- `feature.md` — feature requests (pages, components, UI)
- `content.md` — content, copy, or asset tasks
- `tooling.md` — tooling and infrastructure tasks

Use these templates when creating new issues to keep descriptions consistent.
