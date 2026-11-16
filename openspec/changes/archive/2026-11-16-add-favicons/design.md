# Design

## Context

See proposal.md for the motivation and specs/ for the requirements.

- Beta pre-renders every page. The only per-request routes are the API, the MCP server and `/llms.txt`. Share cards already show how to add 507 build-time files: route handlers under `src/app/swatch/[slug]/card.png/` and `src/app/combination/[n]/card.png/` with `generateStaticParams`, `force-static` and `dynamicParams = false`. Their paths and cache header come from `src/cards/card.ts`, and the cache header is applied in `next.config.ts`.
- The site sets no icon today: there's no `app/icon.*` or `app/favicon.ico`, and no page metadata sets `icons`.
- The landing, about, API docs and 404 pages share the root layout. `not-found.tsx` is a client component and can't read the color library without pulling chroma-js into the client bundle.
- Next.js 16 treats any app-relative path that matches `/icon<n>.(ico|jpg|jpeg|png|svg)` as a static metadata route (`isStaticMetadataRoute` in `next/dist/lib/metadata/is-metadata-route.js`). A route handler folder named `icon.svg` would match that pattern. The share cards are named `card.png` rather than `opengraph-image.png` for the same reason.

## Goals / Non-Goals

**Goals:**
- Use a single mechanism to put the favicon in `<head>` on every page, so the HTML always has exactly one `<link rel="icon">` and client-side navigation never leaves a stale one behind.
- Build the icons the same way as the share cards: static route handlers, with path helpers in one module and no new dependencies.
- Keep the color library out of the client bundle.

**Non-Goals:**
- PNG or `.ico` fallbacks, `apple-touch-icon`, and a web manifest (see proposal).
- Animating the icon, or re-picking the random color on a timer while a page stays open.
- Changing alpha.

## Decisions

### 1. Icon URLs are `favicon.svg`, not `icon.svg`

The icons are served at `/swatch/<slug>/favicon.svg` and `/combination/<n>/favicon.svg`. The spec draft used `icon.svg`, which matches Next's metadata-route pattern, so Next would treat those folders as metadata files rather than ordinary route handlers. `favicon` only gets special handling as `/favicon.ico` at the app root. That makes `favicon.svg` in a nested folder an ordinary route handler, and the name still says what the file is. The specs and proposal are updated to match.

*Alternatives:*
- Use the `app/swatch/[slug]/icon.tsx` metadata convention. It renders a PNG through `ImageResponse`, adds a hashed query string, and injects the `<link>` through metadata. That leaves the landing page's random swap fighting a Next-managed link.
- Keep `icon.svg` and rely on Next tolerating it. That depends on Next internals, so it was rejected.

### 2. Icons are hand-written SVG strings

`src/icons/icon.ts` exports:
- `swatchIconPath(slug)` and `combinationIconPath(n)`, as `card.ts` does for cards.
- `iconSvg(hexes: string[])`.

`iconSvg` returns an SVG with `viewBox="0 0 60 60"`, `shape-rendering="crispEdges"`, and one full-height `<rect>` per color, each `60 / k` wide. The library's combinations have 2 to 4 colors, and 60 is divisible by every count from 1 to 6, so every bar width is a whole number. `crispEdges` stops anti-aliased seams between the bars at 16 px. A swatch icon is `iconSvg([color.hex])`, a single bar.

The route handlers at `src/app/swatch/[slug]/favicon.svg/route.ts` and `src/app/combination/[n]/favicon.svg/route.ts` copy the card routes:
- `force-static`, `dynamicParams = false` and the same `generateStaticParams`
- a 404 for an unknown slug or number
- a `Response` with `Content-Type: image/svg+xml`

`next.config.ts` adds the two icon sources to the existing card cache-header entry, so cards and icons share one cache policy (`CARD_CACHE`).

*Alternatives:*
- `ImageResponse` PNGs. These are heavier and slower to build, they blur bar edges at 16 px, and they add nothing at favicon sizes.
- Static files written by a prebuild script. That would be a second build path when route handlers already cover this.

### 3. One `<Favicon>` client component in the root layout picks the icon

`src/components/Favicon.tsx` (`'use client'`) renders one `<link rel="icon" type="image/svg+xml" href={…}>`. React 19 hoists it into `<head>`, both in the pre-rendered HTML and after client navigation. The root layout renders it once, inside the providers, and passes it `slugs` (the 159 slugs, from `allColors`) and `combinationCount` (`COMBINATION_COUNT`). These are plain props, so chroma-js and the swatch JSON stay on the server.

The component reads `usePathname()`:
- **`/swatch/<slug>` with a known slug:** returns `swatchIconPath(slug)`.
- **`/combination/<n>` with `1 ≤ n ≤ combinationCount`:** returns `combinationIconPath(n)`.
- **Anything else** (`/`, `/about`, `/api`, the 404 page): renders the fallback first, then a `useEffect` keyed on `pathname` picks a random slug with `Math.floor(Math.random() * slugs.length)` and sets state. The first render is therefore deterministic and hydration matches, and each navigation to one of these pages picks again.

Because the layout renders exactly one link and React updates that same element, there's never a second `<link rel="icon">`, and leaving a swatch page can't leave its icon behind. No page or view needs changing, including the client-only `not-found.tsx`.

*Alternatives:*
- `metadata.icons` on each page, plus a client script that mutates the link on random pages. Two owners for one element risks duplicate or reverted links during navigation.
- A `<Favicon>` rendered in each page. That needs eight call sites, and `not-found.tsx` would have to become a server wrapper just to get the slug list.
- A random icon route rendered per request. It breaks the static-only rule and fights browser favicon caching.

### 4. The fallback color is the first color, Hermosa Pink

The pre-rendered HTML of the random pages links `/swatch/hermosa-pink/favicon.svg` (`slugs[0]`, the library's index 1). It's deterministic, the same in every build, and the color appears first in the book. It's also what visitors without JavaScript see.

### 5. Verification is split between `verify:routes` and a browser check

`verify:routes` checks over HTTP:
- every icon URL returns `image/svg+xml`, and its `<rect>` fills equal the color's hex, or the combination's hexes in library order, with equal widths covering the viewBox
- every swatch and combination page's HTML has exactly one `<link rel="icon">` pointing at its own icon
- `/`, `/about` and `/api` link the fallback
- unknown icon URLs return 404

The scenarios that need a running browser (random after load, color changes between visits, swapping on client navigation) are checked once by hand, or with the Chrome tools, before archiving. They're listed as a task. They don't justify adding a headless-browser dependency to the verify scripts.

## Risks / Trade-offs

- **Safari before version 26 and some older browsers ignore SVG favicons** and show the default icon. → Accepted for now; the proposal puts PNG fallbacks out of scope. A later change can add a PNG `rel="icon"` per page from the same `iconSvg` shapes if it's wanted.
- **Browsers cache favicons separately from page caches, and icons are immutable for a year.** → A redesign busts the cache with a version query in `swatchIconPath`/`combinationIconPath`, as the cards do. The colors themselves only change if the swatch JSON changes.
- **Some browsers ignore a changed `href` on an existing `<link rel="icon">`.** → If the browser check shows that, key the `<link>` on its `href` so React replaces the element instead of updating it. This is a one-line change and doesn't affect the specs.
- **The slug list adds about 2.5 KB to every page's RSC payload.** → Accepted. It's smaller than the alternative of shipping the color library to the client.
- **The random pick is visible as a flash from the fallback to the random color on load.** → Accepted. The swap happens right after hydration, and in a browser tab it's barely noticeable.

## Migration Plan

This change only adds things: no URLs change and nothing is removed. It ships with a normal push to `master`. After the deploy, run `verify:routes` against `https://sanzo-wada.dmbk.io` and do the browser check. To roll back, revert the commit.
