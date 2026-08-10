## What

<!-- What does this PR change? Be concrete. For refactors, state it is behavior-preserving. -->

## Why

<!-- The problem/motivation. Link the ticket or related PR if relevant. -->

## Scope / Non-goals

<!-- What this PR deliberately does NOT touch: routes, layouts, global styles,
     fonts, env vars. State the behavior-preserving guarantee here if it's a
     refactor or chore. -->

## Release impact

<!-- Consumer-visible change? Then: version bump + changelog entry.
     Pure tooling/internal/docs? Then: NO bump, NO changelog. State which and why. -->

## Verification (local gates — all must be green)

- `npm ci`
- `npm run lint`
- `npm run build`

## Merge checks (must pass before merge)

- CI
- GitGuardian
- Vercel preview

## Rollback

<!-- How to revert and why it's safe (e.g. single-commit revert, docs-only,
     no data/migration impact). -->
