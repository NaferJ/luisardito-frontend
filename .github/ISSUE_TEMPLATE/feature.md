## What

<!-- What needs to be built? Name the page, component, or feature concretely
     (e.g. /shop/leaderboard rebuild, admin promotions drawer, sidebar
     active-state fix). -->

## Why

<!-- The motivation / user need. Link the project board, related PR, or
     context if relevant. -->

## Scope

<!-- Bullet list of what is included in this issue. Be concrete about
     pages, components, data fetching, and styling. -->

-
-
-

## Non-goals

<!-- What is explicitly NOT included. Call out pages, components, API
     contracts, or backend changes that will not be touched. -->

-
-

## Blocked on

<!-- Optional. Dependencies, backend changes, design assets, or decisions
     that must land before this can start. Remove this section if nothing
     is blocking. -->

-

## Acceptance criteria

<!-- Checkboxes that must all be ticked before the issue is closed. -->

- [ ] Page / component implemented
- [ ] Works with real backend data (if applicable)
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Changelog entry added (if consumer-visible)
- [ ] Linked PR merged

## Verification (local gates — all must be green)

- `npm ci`
- `npm run lint`
- `npm run build`
