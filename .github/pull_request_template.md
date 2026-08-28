## Issue

<!-- Link the issue this PR closes. This auto-closes the issue on merge
     and moves the project board card to Done. -->
Closes #

## What

<!-- What does this PR change? Be concrete. For refactors, state it is behavior-preserving. -->

## Why

<!-- The problem/motivation. Link the related issue, ticket, or context if relevant. -->

## Scope / Non-goals

<!-- What this PR deliberately does NOT touch: pages, components, API contracts,
     env vars, routing. State the behavior-preserving guarantee here if it's a
     refactor or chore. -->

## Release impact

<!-- Consumer-visible change? Then: version bump + changelog entry in
     src/content/changelog/. Pure tooling/internal/docs? Then: NO bump, NO
     changelog. State which and why. -->

## Verification (local gates — all must be green)

- `npm ci`
- `npm run lint`
- `npm run build`

## Merge checks (must pass before merge)

- CI

## Rollback

<!-- How to revert and why it's safe (e.g. single-commit revert, docs-only,
     no data/migration impact). -->
