# Shop UX/UI Redesign — Notes

Working notes for the ongoing shop UX/UI redesign (tracked in
[issue #13](https://github.com/NaferJ/luisardito-frontend/issues/13),
branch `feat/shop-ux-redesign`). Keep this updated as the source of truth
so nothing discussed gets lost between sessions — update it, don't replace
the reasoning with a stale summary.

## Source inspiration

Adapted from a UX teardown of a mobile e-commerce **product page** redesign
(15 mistakes fixed, video: "This UX/UI Redesign Will Teach You More Than 100
Tutorials"). The original covers a real cart/checkout flow; our shop is a
**points-redemption catalog** (no cart, no quantity per redemption — 1 unit
per redeem, `Producto` has no quantity field), so some ideas are adapted or
dropped rather than copied 1:1.

| Video idea | Applies here? | Notes |
|---|---|---|
| Icon contrast over busy images | Yes | Controls over arbitrary product photos need a translucent/blurred pill, not a flat icon. |
| Consistent product imagery / grid | Yes | Masonry feed — aspect ratio consistency, real dims when available. |
| Single font family, line-height | Yes | Audit card + overlay typography. |
| Softer/natural color palette | Adapted | We already have a fixed gold/grayscale token system — audit *usage*, don't introduce a new palette. |
| Remove redundant text labels (e.g. "Price") | Yes | Audit `buildStatRows` and card metadata. |
| Quantity selector next to Add to Cart | **No** | No quantity concept in this catalog. |
| Total price integrated into CTA | Adapted | We already show price near the CTA; consider merging into the button copy itself. |
| Scrollable card over a visible image | Yes | This is the desktop lightbox pattern already; needed on mobile too (see below). |
| Sticky bottom action bar | Yes | Added for mobile in the first fix (see Progress log). |
| Predefined quantities (500g/1kg/2kg) | **No** | Not applicable — dropped, not an oversight. |

## Ground rules (from the owner, not just the checklist)

- This is **not** "tick every box and ship." The repo owner (NaferJ) reviews
  the actual look and feel; the issue stays open until they say it's good
  enough, even if every checkbox above is done. New problems found along the
  way get added to the checklist — do not treat the original list as final.
- Scope for issue #13 is `/shop` catalog surfaces (product feed + product
  detail overlay) only. Sidebar/nav, admin, landing, leaderboard are
  separate, explicitly out of scope for #13 (tracked as their own issues,
  see below).
- The current UI is a customized template — distinct-looking, but never
  audited end-to-end for contrast, redundant info, or responsiveness. The
  goal is real elegance/polish, not just "different from the template
  default."
- Full-detail audit areas: visual hierarchy & grid consistency, icon/control
  contrast, typography, color/palette + contrast ratios (light & dark),
  redundant labels, product detail overlay UX (mobile + desktop), redeem CTA
  clarity, full responsive pass (mobile/tablet/desktop, not desktop-only),
  empty/edge states.

## Related follow-up issues (found during the work, not yet filed or already filed)

- **Mobile navigation was not usable (fixed).** `site-sidebar.tsx` had no
  hamburger/collapsed state — on mobile it rendered the *entire* sidebar
  (logo row, Browse, Account [6 links], Admin [6 links if admin], points,
  footer) stacked inline above the page content. A user had to scroll past
  all of that before seeing any actual page content. Flagged by the owner
  directly ("I can't even see anything... the menu is not responsive").
  This is a bigger scope than #13 (affects every page, not just `/shop`),
  fixed on the same branch since it blocked even viewing `/shop` on mobile.
  See Progress log.

## Progress log

- **Mobile product detail image gap (fixed, on `feat/shop-ux-redesign`):**
  `product-detail-overlay.tsx`'s image (`ProductLightbox`) was `hidden
  lg:flex` — mobile users saw no product image at all in the detail view.
  Rebuilt as: fixed image header (with close/prev/next controls using the
  same translucent-blur circle treatment as the feed card icons) → scrollable
  info sheet overlapping the image → sticky bottom action bar so the redeem
  CTA is always reachable while scrolling. Desktop layout unchanged. Shared
  title/price/description/stats block extracted into `ProductInfo` so mobile
  and desktop can't drift apart.

- **Mobile nav rebuilt (fixed, on `feat/shop-ux-redesign`):**
  `site-sidebar.tsx` no longer renders the full nav inline on mobile. It now
  shows a compact top bar (logo + online count + account pill with points +
  hamburger toggle) and a full-screen drawer (open via the hamburger, closes
  on route change or the X button, locks body scroll while open) holding
  the same Browse/Account/Admin sections and footer content as before.
  Desktop sidebar behavior is unchanged. Extracted `AccountPill`,
  `NavSections`, and `SidebarFooter` so the mobile drawer and desktop
  sidebar share the same markup/logic and can't drift apart. **Owner
  confirmed working** (hamburger opens the drawer correctly on `/shop`).

- **Owner review round 2 — issues found, fixed on `feat/shop-ux-redesign`:**
  - **Online count was "in the way" on mobile.** It used to render as its
    own standalone row (`site-shell.tsx`) above the page content on every
    screen size, wasting vertical space on mobile right when you land on a
    page. Moved into the compact mobile top bar (next to the logo);
    `site-shell.tsx`'s standalone row is now `hidden lg:flex` (desktop
    only, where it already worked fine at the top of the content column).
  - **Points balance invisible on mobile without opening the drawer.**
    `AccountPill` (the avatar+name chip in the top bar) now takes a
    `showPoints` prop; the mobile top bar passes it so the balance always
    shows next to the avatar, matching the online-count's plain-text style.
    Desktop keeps points in the sidebar footer only (no duplication).
  - **Redeem cooldown blocked redeeming a *different* product.** Bug in
    `useRedeemProduct` (`product-detail-overlay.tsx`): the 5s post-redeem
    cooldown was keyed to the overlay session, not the product, so
    redeeming product A and then arrow-navigating to product B left B's
    redeem button disabled too. Now resets `cooldown` alongside `result`
    whenever the product changes — this was the "user can't even buy two
    things" report.
  - **Redundant price info in the overlay.** `buildStatRows` repeated the
    price as its own "Price"/"Original" row even though the price is
    already shown big and gold right above it. Removed both rows; stat
    rows are now Stock / Status / (Discount, if on sale) only.
  - **No icons, weak scan hierarchy.** Added a small `lucide-react` icon
    per stat row (`Package` for stock, `BadgeCheck` for status, `Tag` for
    discount) and bumped the price to `20px font-semibold` (was the same
    size as the label text next to it) so the panel reads price → name →
    description → scannable icon rows, top to bottom, without re-reading
    the same number twice. `lucide-react` was already a dependency used
    elsewhere in this file — no new icon library added; these are real
    SVG icons, not emoji.
  - **No tactile feedback on buttons.** Added `active:scale-9X` +
    `transition-transform` to the redeem CTA, the overlay's close/prev/next
    controls, the card bookmark button, and the sidebar's login/signup/
    logout/menu buttons. Kept it subtle (short duration, small scale) —
    this is a debounce-feel affordance, not a bouncy animation.
  - **Animated side decorations (`side-decor.tsx`) were desktop-only**
    (`hidden lg:block`) — the owner called this out as core to the site's
    identity ("it likes the essence of the webpage") and wanted it on
    mobile/tablet too. Now always rendered, with width capped at the
    page's own edge padding below `lg` (`w-1.5` mobile → `w-2` sm → `w-4`
    md → full `120px` at `lg`) so the decoration only fills margin that's
    already there instead of creeping into real content.
  - **"Categories" pills were actually sort options, and confusing.**
    `shop-browse.tsx` had 6 pills (5 sort orders + "On Sale") all styled
    identically, so "On Sale" looked like a 6th sort mode instead of the
    filter it actually is (and mixing a single-select sort with a toggle
    filter in one pill row is what read as "confusing categories"). Split
    into a single compact `<select>` dropdown for sort order + a separate
    "On Sale" toggle pill. Also deleted `src/components/filter-pills.tsx` —
    an entirely unused leftover from the design-portfolio template (fake
    categories: Web/Interface/Branding/Typography/... — never imported
    anywhere) and its backing `categoryFilters` export in `nav-data.ts`.
  - **Search input too narrow.** Was `w-40` (160px), clipping the
    "Search products..." placeholder, and only widened on focus. Now
    `min-w-[11rem]` and full-width on mobile, `sm:w-56` on larger screens,
    no focus-only widening.

## Owner review round 3 — live feedback + video reference

### Owner live feedback (this session)

- **Online count in mobile top bar —** "ok, looks fine."
- **Points balance in mobile top bar —** "amazing I like what u did, creative."
- **Menu must stay visible while scrolling.** On mobile the compact top bar
  (logo + online count + account + hamburger) should remain reachable as
  the user scrolls the feed.
- **Product slug/overlay needs page-to-page animation.** When a user opens
  a product, navigates prev/next, or lands on a slug URL, the image and
  content should animate, not snap instantly.
- **"Canjear" CTA is too close to phone system buttons.** The sticky bottom
  button currently sits right at the gesture/home-bar area. It needs more
  bottom padding above `env(safe-area-inset-bottom)` so it does not
  compete with the OS chrome. The owner also restated that the slug
  product page must be scrollable.
- **Product image should be smaller and the border/gap hidden with
  transparency.** The mobile overlay image is currently full-width and the
  detail sheet is opaque, creating a hard edge. The image should be
  smaller/centered, and the detail sheet should be a translucent/glass
  floating card that overlaps the image so the transition is seamless.
- **Sort dropdown + "On Sale" toggle is better on mobile only.** On desktop
  the original sort pills should be restored; the dropdown is a mobile
  space-saver, not a global replacement.
- **Footer is not visible on mobile.** The footer content only exists inside
  the hamburger drawer right now; it needs to be reachable/visible on
  mobile pages, not hidden behind a menu.

### Video reference — "This UX/UI Redesign Will Teach You More Than 100 Tutorials" (full transcript)

> **Introduction and error spotting (0:01 - 0:38)**
> "Take a look at this ugly product page. I want you to look at it carefully. How many UX and UI mistakes can you spot? Pause the video. Write your number in the comments. But be honest, okay? Ready? If you found at least 10 mistakes, congratulations. You are a great designer. I can see at least 15 major mistakes. Some are obvious, some are much easier to miss. My goal is that by the end of this video, you'll know how to design the best product pages that users absolutely love. So, let's apply some of our UX peak magic and fix it one by one. The difference will be huge, and I'll reveal a few cool surprises as well."

> **Foundation and Visuals (0:39 - 4:17)**
> - **Icons (0:39):** Controls/icons over busy product images need a
>   container with enough contrast and a subtle outline so they stay
>   visible regardless of the photo behind them.
> - **Images (2:00):** Product images should be clean, natural, and
>   consistent so they work in a grid layout.
> - **Alignment (3:36):** Standardize margins and layout grids for a
>   professional, trustworthy feel.

> **Style and Typography (4:17 - 6:50)**
> - **Color (4:17):** Move away from overly saturated colors to a softer,
>   more natural palette that keeps focus on the product.
> - **Typography (4:53):** Use one font family and adjust hierarchy.
> - **Labels (5:19):** Clean up badges and spacing.
> - **Title and Text (5:51 - 6:21):** Adjust header size and paragraph line
>   height for better scanning.

> **UX Logic and Buying Flow (6:51 - 11:32)**
> - **Reviews (6:51):** Move the rating closer to the title to build trust
>   immediately.
> - **Feature Icons (8:24):** Standardize visual logic for benefits.
> - **Dividers (8:58):** Soften harsh divider lines for a more elegant UI.
> - **Spacing (9:25):** Balance section whitespace.
> - **Pricing (9:50):** Remove redundant labels and improve price hierarchy.
> - **Quantity/Purchase (10:18 - 11:32):** Keep quantity and Add to Cart
>   together in the user's mental model; put the total price inside the
>   CTA to reduce friction.

> **Advanced UX Enhancements (11:46 - 13:32)**
> - **Scrollable Cards (11:46):** Turn the content into a floating,
>   scrollable card so the product image stays visible while the user
>   reads the description.
> - **Sticky Action Area (12:18):** Pin the primary action to the bottom so
>   it is always reachable, no matter how far the user scrolls.
> - **Predefined Quantities (12:44):** Offer common quantity presets to
>   reduce repetitive manual selection.

> **Outro (13:19 - 13:32)**
> "So, what do you think? Is this new version better than the original? How many of the 15 mistakes did you spot before I revealed them? Let me know in the comments. I'm genuinely curious to see how many you found. Thank you for watching and see you in the next."

### Notes from the three study questions

- **How are layout grids implemented in mobile design?** Consistent
  horizontal margins and a clear vertical rhythm make the page feel
  structured instead of accidental. Every section should align to the same
  invisible grid, not float with arbitrary padding.
- **Why are sticky CTAs important for conversion?** The primary action stays
  in the thumb zone at all times; the user never has to scroll back up to
  act, which removes friction and increases completion rate.
- **What defines a scalable UI system?** Reusable visual rules — one type
  scale, one color logic, one spacing scale, consistent component
  behaviors — so new screens can be built without re-inventing decisions.

### Mapping the 15 mistakes to our points shop

| # | Video mistake / fix | How it applies to Luisardito Shop |
|---|---|---|
| 1 | Icon contrast / container over image | Overlay close/prev/next and feed card badges already use `bg-background/80` + `backdrop-blur`. Audit and add a subtle ring if needed. |
| 2 | Image consistency / natural grid | Feed already uses real `imagen_width/height` and a masonry distribution. Keep honoring real aspect ratios and avoid forcing square crops. |
| 3 | Consistent layout grid | Mobile overlay needs a clear grid: smaller centered image, glass card, sticky CTA with consistent padding. |
| 4 | Color palette softer / natural | We stay in the grayscale + gold token system; use the tokens consistently and avoid harsh opaque backgrounds. |
| 5 | Single font family / line-height | Already Geist Sans across the board; audit overlay card line-height. |
| 6 | Badges and labels spacing | Stat rows use icons + label/value; keep spacing even. |
| 7 | Title/header size and paragraph line-height | Price, name, and description need a clear size ladder. |
| 8 | Reviews near title (trust) | We do not have product ratings, but we do have "last redeemer" on the card and stock/discount. Move trust signals (stock, status, discount) close to the title. |
| 9 | Feature icons visual logic | Use one icon style (outlined `lucide-react`) and one placement per row. |
| 10 | Soften dividers | Use `border-border/30` or `border-border/20` in the glass card, not full-strength `border-border`. |
| 11 | Balanced whitespace | Add consistent vertical rhythm inside the mobile card. |
| 12 | Remove redundant price label | Already removed the duplicate price/original rows. |
| 13 | Quantity + Add to Cart grouped + total in CTA | No quantity concept, but the **points cost can be integrated into the redeem button** so the user sees the full transaction in one place. |
| 14 | Floating scrollable card | Mobile overlay should be a glass card over the product image. |
| 15 | Sticky action bar + quick options | Keep the sticky CTA but lift it above the OS safe area; skip quantity presets (not applicable). |

## Owner review round 4 — fixes implemented on `feat/shop-ux-redesign`

- **Top bar grouping.** `OnlineStatus` moved to the same right-hand group
  as the `AccountPill` (points) and hamburger, so status, points, and menu
  are together instead of split across the bar.
- **Redeemed count added.** The overlay stat rows now include a "Redeemed"
  row using `product.canjes_count` so the user can see how many people
  already redeemed the product.
- **CTA now stays at the bottom.** The mobile CTA bar uses `absolute
  bottom-0` inside the scrollable card and the content wrapper uses
  `min-h-full`, so the button is always at the bottom even when the product
  info is short, and it stays visible while the user scrolls the "More
  products" grid.
- **Full product image + image colors in the background.**
  - The mobile product image is now `object-contain` and centered, so the
    whole product is visible.
  - The overlay background is a blurred, low-opacity copy of the same image
    with a `bg-background/70` scrim, so the page subtly takes on the
    product's colors and the image "bleeds" into the page.
  - The `MobileImageHeader` container is transparent (`bg-transparent`) so
    the blurred background shows through any transparent PNG edges.
- **More products grid inside the overlay.** The mobile overlay now has a
  scrollable 2-column grid of other products below the current product.
  Tapping a mini card navigates to that product, so the user can scroll and
  pick the next product instead of using the arrow buttons.
- **Build/lint verified** after the changes.

## Owner review round 5 — fixes implemented on `feat/shop-ux-redesign`

- **Top bar: online count back to the left.** `OnlineStatus` now lives in
  the left group next to the logo; the right group is `AccountPill` + menu.
- **Compact number formatting (K/M).** Added `formatCompactNumber` in
  `lib/utils.ts` and used it for:
  - online user count (`OnlineStatus`)
  - user points balance (`AccountPill`)
  - product prices/original prices in the overlay
  - "Redeemed" stat count
  - "You need X more points" message
  - `product-mapper.ts` so `DesignCard` data carries compact prices.
  Examples: `193900` → `193.9K`, `5050000` → `5.05M`, `2000` → `2K`.
- **Larger mobile product image.** Mobile header is now `38vh` / `max-h-[300px]`
  with `max-w-80`, and the glass card overlap is reduced from `-mt-10` to
  `-mt-8` so more of the product image is visible.
- **More products uses `DesignCard`.** The overlay's "More products" grid now
  uses the exact same `DesignCard` component as the shop feed, so the cards
  are consistent and the text-over-image readability problem is gone.
- **CTA lifted slightly more.** Bottom padding is now `1.5rem` above the safe
  area, so it sits just a little higher than before.

## Owner review round 6 — fixes implemented on `feat/shop-ux-redesign`

- **Mobile top bar flush with the top.** The sticky top bar now uses
  `-mt-4` so it sits at the very top of the viewport when the page is at
  rest, matching the scrolled look.
- **Mobile footer safe area.** Footer now uses
  `pb-[max(env(safe-area-inset-bottom)+1.5rem,1.5rem)]` so it clears the
  phone's bottom buttons the same way the overlay CTA does.
- **Overlay scrollable, CTA no longer moves.** The mobile product card now
  has two siblings: a scrollable `overlay-content` (`flex-1 min-h-0
  overflow-y-auto`) and a `shrink-0` CTA bar. The CTA stays at the bottom
  while the user scrolls the product info and "More products" grid.
- **CTA lifted more.** The CTA bar now has `2rem` bottom padding above the
  safe area, so the button is raised further from the OS gesture bar.
- **Side decor / lines no longer overlap the overlay.** `SiteShell` z-index
  raised from `10` to `20`, putting the page and the product overlay above
  the animated side strips so the product image is clean and symmetric.
- **Overlay background slightly cleaner.** Reduced blur image opacity to
  `0.4` and increased the scrim to `bg-background/80` so the product image
  stands out more against the background.
- **Build/lint verified** after the changes.

## Owner review round 7 — fixes implemented on `feat/shop-ux-redesign`

- **Scroll-driven image shrink + title bar.** The mobile overlay now scrolls as
  one page. As the user scrolls, the product image shrinks (`scale` down to
  ~0.55) and a sticky top bar fades in with the product name and close/
  previous/next controls once the image is about to leave the viewport.
- **Image rounded on all corners.** Changed the `MobileImageHeader` container
  from `rounded-b-2xl` to `rounded-2xl` so the top corners are also rounded,
  matching the example screenshot.
- **Image container background.** The product image container now uses
  `bg-background/90` so transparent PNGs get a clean background instead of
  showing the blurred image through, making every product look like the
  example.
- **CTA lifted ~10px more.** Bottom padding is now `2.5rem` above the safe
  area.
- **Build/lint verified** after the changes.

## Owner review round 8 — fixes implemented on `feat/shop-ux-redesign`

- **Normal design + side decor layering fixed.** Removed `z-20` from
  `SiteShell` so it no longer creates a stacking context. The overlay and
  sidebar now get their own `z-20`/`z-40` indices, so the overlay covers the
  side decor while the shop feed returns to the original layering.
- **CTA always visible.** Mobile CTA is now `sticky bottom-0` in the overlay
  scroll container and the content has `pb-28` so it doesn't get hidden behind
  the button.
- **Image and its parent shrink together on scroll.** Instead of only scaling
  the image, the whole `MobileImageHeader` now shrinks in height as the user
  scrolls, so the image container and image move together.
- **Larger image size.** Raised mobile header to `40vh` / `max-h-[340px]` and
  the image container `max-w` to `96` / `sm:max-w-md` so product images are
  bigger and easier to see across resolutions.
- **Build/lint verified** after the changes.

## Owner review round 9 — fixes implemented on `feat/shop-ux-redesign`

- **Image container is transparent again.** The `MobileImageHeader` media
  container went back from `bg-background/90` to `bg-transparent` so product
  images with transparent PNGs show the blurred product background behind
  them (matching the good example) and images with their own background (like
  the Miku figure) no longer get a solid color box around them.
- **Scroll shrink is slower.** The header shrinks at `0.6x` the scroll
  distance now instead of `1:1`, so the image stays visible longer and the
  collapse feels smoother.
- **Removed the bookmark icon from More products.** The `DesignCard` component
  now has an optional `hideBookmark` prop, and the overlay's More-products
  grid passes `hideBookmark` so the "book" icon does not appear in that
  context. The main shop feed still keeps the bookmark for consistency.
- **Build/lint verified** after the changes.

## Owner review round 10 — root-cause fixes implemented on `feat/shop-ux-redesign`

The owner reported (with screenshots) that the "More products" grid was still
being cut in half by the "Canjear" bar, and that the product image was
partially hidden behind the glass card with broken-looking rounded corners.
Root-caused both:

- **CTA overlap root cause: `position: sticky` inside normal flow.** The CTA
  was a `sticky bottom-0` *sibling* of the scrollable content, both inside the
  same flex-col container. A sticky element only "unsticks" once its own flow
  position reaches the bottom of the viewport — until then it stays pinned on
  top of whatever is still scrolling underneath it, so it visually cut through
  the grid rows before the user reached the actual end of the content. Fixed
  by pulling the CTA **out of the scrollable overlay entirely** into its own
  real `fixed inset-x-0 bottom-0` element (a sibling of the scroll container,
  not a flex child inside it). This is not affected by scroll position at all,
  so it can never overlap/cut through content again. Added `pb-40` to the
  scrollable content so the last "More products" row always clears the fixed
  bar.
- **Image partially hidden root cause: `-mt-8` overlap ate into the image.**
  The glass content card used a negative top margin to overlap the image
  header for a "seamless" look, but that also covered the bottom ~32px of the
  image itself (and its bottom rounded corners), which is why the corners
  "didn't work" — they were sitting under the opaque card the whole time.
  Removed the overlap (card now starts exactly where the header ends), so the
  full image and all four rounded corners are always visible.
- **Image not always fully visible across resolutions.** The image container
  used to combine an inline `aspectRatio` (from the product's real width/
  height) with `max-h-full`, which conflicts once the header's height clamps
  it — the browser can't shrink both dimensions in sync, so tall/wide images
  at certain header heights got clipped or the box didn't match the image's
  real proportions. The container is now just a fixed box that fills the
  header (`h-full w-full`, with padding on the header for breathing room);
  `object-contain` on the `<Image>` itself (not the container) is what keeps
  every product's real aspect ratio fully visible and centered, consistently
  across portrait/landscape/square images and any screen size.
- **Build/lint verified** after the changes.

## Still open / not yet addressed

- **Total price in CTA (point 13).** Not implemented yet — the button still
  says "Canjear". We could show the points cost inside the button (e.g.
  "Canjear — 1,250 pts"), but the owner should confirm whether this reads
  as helpful or repetitive before shipping.
- **Color/palette + contrast audit against the gold/grayscale tokens.** The
  glass overlay uses the tokens, but a full light/dark contrast pass
  (especially for the translucent background/foreground combinations)
  still needs review on a real device.
- **Full responsive pass on feed, cards, and overlay.** Mobile overlay is
  updated; the feed and card contrasts need the same level of real-viewport
  review.
- **Typography scale and line-height audit.** Price, title, description,
  and stat rows need a real-device read to confirm the hierarchy is
  scannable and the line heights are not too tight.
- **Owner visual review on a real mobile viewport.** All of the above are
  code-level implementations based on the video and the owner’s feedback;
  they need to be seen live and iterated on.
