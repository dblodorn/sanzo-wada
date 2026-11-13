# Tasks

## 1. Icon module

- [x] 1.1 On a new branch, add `src/icons/icon.ts` holding:
  - `swatchIconPath(slug)` and `combinationIconPath(n)` (`/swatch/<slug>/favicon.svg`, `/combination/<n>/favicon.svg`)
  - `iconSvg(hexes)`, laid out as in design decision 2: a 60 × 60 `viewBox`, `shape-rendering="crispEdges"`, and one full-height `<rect>` per color, each `60 / k` wide

  Verify that `typecheck` passes and that a scratch `tsx` run prints the expected SVG for `hermosa-pink` (one rect filled `#ffb3f0`), for combination 1 (two 30-wide rects) and for combination 241 (four 15-wide rects).

## 2. Icon routes

- [x] 2.1 Write `src/app/swatch/[slug]/favicon.svg/route.ts` with these exports, copying the card route:
  - `generateStaticParams` from `colorSlugs()`
  - `dynamic = 'force-static'`
  - `dynamicParams = false`
  - a `GET` that returns `iconSvg([color.hex])` with `Content-Type: image/svg+xml`, or a 404 for an unknown slug

  Verify with these checks:
  - `pnpm build:beta` lists `/swatch/[slug]/favicon.svg` as prerendered with 159 paths, and Next doesn't treat it as a metadata route (no hashed `favicon.svg-xxxxxx` path, no icon link added by Next to the pages).
  - `curl -I` against `pnpm start` gives 200 and `image/svg+xml` for `hermosa-pink`, and 404 for `not-a-color` and `hay's-russet`.
- [x] 2.2 Write `src/app/combination/[n]/favicon.svg/route.ts` the same way, with the combination's hexes in library order. Verify with these checks:
  - The build lists 348 paths.
  - `curl` gives 200 and `image/svg+xml` for `/combination/1/favicon.svg` and `/combination/348/favicon.svg`.
  - `curl` gives 404 for `/combination/0/favicon.svg` and `/combination/349/favicon.svg`.
- [x] 2.3 Add both icon paths to the card `Cache-Control` entry in `next.config.ts`, keeping the existing headers and redirects. Verify with `curl -I` that an icon returns `public, max-age=31536000, immutable`.

## 3. Favicon component

- [x] 3.1 Write `src/components/Favicon.tsx` (`'use client'`), as in design decision 3:
  - It takes `slugs` and `combinationCount` as props and reads `usePathname()`.
  - A known swatch path renders that swatch's icon link, and a valid combination path renders that combination's.
  - Any other path renders `slugs[0]` (Hermosa Pink) first, then picks a random slug in a `useEffect` keyed on `pathname`.
  - It renders exactly one `<link rel="icon" type="image/svg+xml">`.

  Export it from `src/components/index.ts`. Verify that `typecheck` passes.
- [x] 3.2 Render `<Favicon>` once in `src/app/layout.tsx`, passing the slugs from `allColors` and `COMBINATION_COUNT`. Verify against `pnpm start` that:
  - the HTML for `/swatch/hermosa-pink` has exactly one `<link rel="icon">`, pointing at `/swatch/hermosa-pink/favicon.svg`, and its `<title>` and meta description are unchanged;
  - `/combination/1` points at `/combination/1/favicon.svg`;
  - `/`, `/about`, `/api` and an unknown path point at `/swatch/hermosa-pink/favicon.svg`;
  - the client bundle doesn't include chroma-js or the swatch JSON (grep the `.next/static` chunks for a chroma-js identifier and a swatch name that isn't a slug, such as `Hermosa Pink`).
- [x] 3.3 In a browser (by hand or with the Chrome tools), check the scenarios that need scripts:
  - `/` loaded several times shows different icon colors, with one `<link rel="icon">` each time and no hydration warning in the console.
  - `/about`, `/api` and `/swatch/not-a-color` get a random icon.
  - Going from `/swatch/hermosa-pink` to `/combination/1` swaps the icon, and the "Index" link back to `/` swaps in a random one, with no stale swatch link left in `<head>`.

  If a browser doesn't update the tab icon on an `href` change, add `key={href}` to the `<link>` (design, third risk) and check again.

## 4. Verification script

- [x] 4.1 Extend `scripts/verify-routes.ts` with these checks:
  - all 507 icons have status 200 and `image/svg+xml`;
  - each icon's `<rect>` fills equal the color's hex, or the combination's hexes in library order, with equal widths covering the `viewBox`;
  - the 404 icon cases;
  - every swatch and combination page has exactly one `<link rel="icon">`, pointing at its own icon;
  - `/`, `/about` and `/api` link the fallback swatch icon.

  Update the final `OK:` summary line. Verify that it passes against `pnpm start`, and that it fails when one combination icon's color order is deliberately reversed.
- [x] 4.2 Run the full set of checks against a fresh `pnpm build:beta` and `pnpm start`, and verify that all of them pass:
  - `typecheck`
  - `verify:colors`
  - `verify:routes`
  - `verify:api`

## 5. Docs and release

- [x] 5.1 Update `CLAUDE.md` (the beta architecture section): describe the icon routes, `src/icons/`, the `<Favicon>` component in the layout, the random pick and its fallback, and why the routes are named `favicon.svg`. Update the `verify:routes` command description. Verify that the text matches the code.
- [ ] 5.2 Open a PR. After it is merged and deployed, run `verify:routes` against `https://sanzo-wada.dmbk.io` and check that it passes. Also repeat the browser check from 3.3 on production.
