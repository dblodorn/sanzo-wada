# Design

## Context

See proposal.md for the motivation and the specs for the requirements. What shapes the approach:

- **Alpha's runtime:** alpha is a client-only SPA. The color data, window size and an unused `fonts_loaded` flag live in Redux. Views read the route by parsing `state.router.location.pathname` in HOCs (`swatchData`, `comboData`).
- **Styling:** all styling is styled-components 3: `injectGlobal`, `css`-based `media.small` (≤500px) / `media.medium` (≤1240px) mixins, `keyframes` and styled `react-router` `Link`s. Several styled components read custom props (`hex`, `hexVal`) to compute colors with chroma-js.
- **Data:** every page's data comes from a fixed dataset (159 colors, 348 combinations), and nothing changes at runtime.
- **Monorepo:** pnpm 8 workspace with Turborepo. `packages/sw-tsconfig` (`@sw/tsconfig`) exists but nothing uses it yet. There is no lint or test setup, and husky has no pre-commit hook installed, so the root `lint-staged` config never runs.
- **chroma-js versions:** chroma-js 3.2.0 gives the same results as alpha's 1.4.1 on this dataset: the same hex and RGB for all 159 colors, the same contrast decisions against `#dbdbdb`, and the same `darken(.2/.5/1.125/1.5)` shades of `#dbdbdb`. These were compared on the swatch JSON while writing this design.

## Goals / Non-Goals

**Goals:**

- Port each alpha module one-to-one: keep component boundaries, styled-component templates and file names recognisable, so a diff against alpha is easy to review.
- Run the color library only at build time on the server, and send pages their data as plain props.
- Use strict TypeScript across the whole app.

**Non-Goals:**

- No restyling, no component redesign and no accessibility or performance work beyond what the move to Next.js brings by itself.
- No shared workspace package for the color library. It lives in the beta app, and alpha keeps its own copy until the cutover deletes alpha.
- No changes to `assets/colors.json`. The only swatch data change is the Dull Violet Black magenta correction (Decision 5).
- No lint or test infrastructure beyond the type check and the parity checks below.

## Decisions

### 1. Next.js App Router with build-time pre-rendering on Vercel (no `output: 'export'`)

`app/page.tsx`, `app/about/page.tsx`, `app/swatch/[slug]/page.tsx` and `app/combination/[n]/page.tsx` are server components. The two dynamic routes export `generateStaticParams` (built from the library's slug list and the range 1–348) and set `dynamicParams = false`. Each also exports `notFound()` handling, which covers the spec's 404 requirement. `app/not-found.tsx` provides the 404 page. All pages come out of `next build` as static HTML.

- **Why not `output: 'export'`:** on Vercel the default build already serves the pre-built pages from the CDN. It also returns a real 404 status for paths that weren't generated, and it decodes the punctuated slugs correctly. A plain static export would need `trailingSlash`/rewrite workarounds and gives up both of those. Static export only matters for hosts other than Vercel, and that is out of scope.
- **Why not the Pages Router:** the App Router is what Next.js 16 is built around, and with `generateStaticParams` server components can hand computed data straight to client views. That is exactly the server/client split this port needs.

### 2. Server pages compute data and client views render it

Each page (a server component) calls the color library and passes plain serialisable data to a `'use client'` view component ported from alpha: `views/Landing`, `views/Swatch`, `views/Combination` and `views/About`. The views must be client components because styled-components and the event handlers need them.

alpha's HOCs (`withStore`, `swatchData`, `comboData`) are removed:
- the data they looked up now comes in as props
- route params replace pathname parsing

Unknown slugs and numbers never reach a view, because `dynamicParams = false` 404s them.

**Alternative considered:** a React context for the color data, like alpha's store. Rejected because the data is fixed per page and already known at build time, so a context would add the whole dataset to every page's client bundle for nothing.

### 3. React state replaces Redux

| Alpha store slice | Beta replacement |
|---|---|
| `color_data` | Props from server pages (Decision 2) |
| `resize_state` | `WindowSizeProvider`, a client context in the root layout. Same `window.innerWidth/innerHeight` shape, same 50ms `lodash/throttle` on `resize` |
| `fonts_loaded` | Dropped: nothing reads it. The fonts load through a stylesheet (Decision 6) |
| `router` | Next.js routing; `useParams` is not needed because pages pass the param through as a prop |
| Landing `table` toggle | `useState` in the Landing view (alpha already kept it in local component state) |

Before the browser has measured the window, the server render and first client render use a fixed default width of `breakpoints.desktop` (1240). Server and client HTML therefore match on hydration, and the real width is set in `useEffect` right after mount (see the Risks section on the label flash).

### 4. styled-components 6 with the Next.js SSR registry and SWC transform

Upgrade to styled-components 6 (alpha uses 3). Add the App Router style registry (`lib/registry.tsx`, using `useServerInsertedHTML` + `ServerStyleSheet`) to the root layout, so every pre-built page carries its CSS. Turn on `compiler.styledComponents` in `next.config.ts` for display names and SSR class-name consistency, as `babel-plugin-styled-components` did in alpha.

Mechanical changes from v3 that keep the CSS the same:
- `injectGlobal` → a `createGlobalStyle` `GlobalStyle` component rendered in the layout, with the same CSS text (normalize, root font-size steps, etc.)
- Custom style props become transient props (`hex` → `$hex`, `hexVal` → `$hexVal`), so they aren't forwarded to the DOM. v6 warns and leaks attributes otherwise.
- `styled(Link)` wraps `next/link` instead of `react-router-dom`'s `Link`. `to=` becomes `href=`.
- `keyframes` are already interpolated inside `css` helpers in alpha, which v6 requires, so no change.
- The `media` helpers keep their `(...args) => css\`...\`` shape and get typed as tagged-template functions.

**Alternatives considered:**
- Converting to CSS Modules: rejected, because it breaks the "keep the styling the same" constraint and makes review harder.
- Staying on v3: impossible, since v3 has no React 18+/App Router SSR support.

### 5. Typed color library ported from `colors.js` / `swatches.js`

The library lives at `apps/sanzo-wada-beta/src/colors/`, with the six swatch JSON files copied as they are.

`types.ts` defines:
- `CMYK = readonly [c: number, m: number, y: number, k: number]`, and the same tuple for `RGB`
- `RawColor` (`name`, `cmyk: CMYK`, `combinations: readonly number[]`)
- `Color` (`index`, `name`, `slug`, `cmyk_array`, `cmyk`, `rgb_array`, `rgb`, `hex`, `combinations`, `use_count`). Alpha's snake_case keys are kept so the ported views read the same fields.
- `SwatchGroup` (`{ swatches: Color[] }`)
- `CombinationColor = Pick<Color, 'hex' | 'name' | 'slug'>`
- `Combination` (`{ number, colors }`)

`colors.ts` keeps alpha's algorithm with native array methods instead of the `lodash/wrapperLodash` mixins: divide CMYK by 100, `chroma.cmyk`, `.rgb()`, the same slug regex, the same string formats.

`index.ts` exports:
- `swatchGroups: SwatchGroup[]` (per-group index, alpha's `swatchArray`)
- `allColors: Color[]` (flat index, alpha's `swatchArrayAll`)
- `getColorBySlug(slug: string): Color | undefined`
- `getCombination(n: number): Combination | undefined`
- `colorSlugs()` and `combinationNumbers()` for `generateStaticParams`
- `COMBINATION_COUNT = 348`, which replaces the hardcoded `'348'` in the Combination view

Combinations are derived from `allColors` in flat order, which matches `comboData`.

`resolveJsonModule` types `cmyk` as `number[]`, not a 4-tuple, so a small `parseRawColors()` checks at module load that each entry has four numbers from 0 to 100 and integer combination numbers, then returns `RawColor[]`. A malformed edit to the JSON fails the build instead of being silently cast.

Use chroma-js 3.2.0, which gives the same output as alpha's 1.4.1 (see Context). It doesn't ship types, so types come from `@types/chroma-js@3`. The parity check (Decision 9) guards this.

The source data has one out-of-range value: Dull Violet Black's magenta is 106. It is corrected to 100 in beta's copy of `swatches_d.json`. chroma clamps the value, so the hex doesn't change. The parser's 0–100 check then guards future edits, and `verify-colors.ts` treats that color's two CMYK fields as the only expected difference.

### 6. Fonts and static assets through `public/assets`

Copy alpha's `assets/` folder as it is to `apps/sanzo-wada-beta/public/assets/`, so `/assets/colors.json`, `/assets/fonts.css`, `/assets/fonts/*.woff` and `/assets/swada-colors.jpg` keep their URLs.

Load `fonts.css` with a `<link rel="stylesheet" href="/assets/fonts.css">` in the root layout's `<head>`, replacing webfontloader. The font-family names (`fff-regular`, `fff-italic`) and the `@font-face` rules don't change, so `theme.json`'s `fonts.sans` / `fonts.italic` stacks work unchanged.

**Alternative considered:** `next/font/local`. Rejected because it renames the families and moves the files, so `theme.json` and `/assets/fonts.css` would no longer be the source of truth.

### 7. Copy-hex, metadata and navigation

- **Copy-hex:** `CopyHex` becomes a function component with `useState` + `useEffect` cleanup for the 2.5s timer. It keeps `react-copy-to-clipboard` (its peer range `react >=15.3` accepts React 19) and the same `:after` notice CSS and `animationFadeUp(1150, 15)`.
- **Metadata:** the root layout exports alpha's `<title>`, description and viewport through the `metadata` / `viewport` exports. A white `body` background replaces `bgcolor`.
- **Navigation:** `next/link` scrolls to the top on navigation by default, which replaces `App.js`'s `history.listen(() => window.scrollTo(0, 0))`.

### 8. Workspace, build targeting and the Vercel project

- **Package:** `apps/sanzo-wada-beta` with `name: "sanzo-wada-beta"`. Scripts: `dev` (`next dev`), `build` (`next build`), `start` and `typecheck` (`tsc --noEmit`). Dependencies: Next 16, React 19, styled-components 6, chroma-js 3, lodash (`throttle` only) and react-copy-to-clipboard.
- **tsconfig:** extends `@sw/tsconfig/base.json` (strict) plus Next's required options (`moduleResolution: "bundler"`, `jsx: "preserve"`, the `next` plugin and `paths` for `@/*`).
- **Root `package.json`:**
  - `build` becomes `pnpm install && turbo run build --filter=sanzo-wada-alpha && cp -r apps/sanzo-wada-alpha/dist .`, so Netlify keeps building only alpha
  - add `dev:beta` / `build:beta` (`turbo run dev|build --filter=sanzo-wada-beta`)
- **`turbo.json`:** `build.outputs` gets `.next/**` and `!.next/cache/**`.
- **Vercel project:** a new project linked to this repository.
  - Root Directory `apps/sanzo-wada-beta`, framework preset Next.js
  - Vercel detects pnpm from the root lockfile and installs the workspace
  - Build command `turbo run build --filter=sanzo-wada-beta`, run from the monorepo root through Vercel's Turborepo support. The ignored build step is `npx turbo-ignore`, so commits that only touch alpha don't deploy beta.
  - No `netlify.toml` changes, and no Vercel config in alpha.

### 9. Verification instead of a test suite

The repo has no test runner, and adding one is a non-goal. Parity is checked with two one-off scripts in `apps/sanzo-wada-beta/scripts/`, plus a manual pass:

- **`verify-colors.ts`:** imports both alpha's `swatches.js` output (its `colors.js` and JSON) and beta's library, and asserts that every field of every color and every combination's color list are identical.
- **`verify-routes.ts`:** runs against `next start` after a build. It requests all 509 URLs (including the literal and percent-encoded punctuated slugs) and asserts 200, then checks that the 404 cases return 404.
- **Manual side-by-side pass:** alpha (`pnpm dev:alpha`) and beta compared at 375px, 1024px and 1440px.

## Risks / Trade-offs

- **[Label flash on narrow screens]** The pre-built HTML uses desktop labels ("Swatch View", "List View", "JSON API") and the desktop list columns, then switches after mount. → Accepted: alpha showed nothing until JS ran, so this is still an improvement. Moving the labels to CSS would change the JS behaviour the user asked to keep. Revisit after the cutover if it's noticeable.
- **[Punctuated slugs in params]** Next.js has changed between versions whether params from `generateStaticParams` arrive URL-encoded. → Pages run `decodeURIComponent` on the slug before lookup, and `verify-routes.ts` covers all five punctuated slugs in both forms.
- **[styled-components 6 behaviour drift]** v6 drops vendor prefixing by default, and the transient-prop rename could miss a prop. → Turn on `enableVendorPrefixes` in the `StyleSheetManager` to match v3's output (alpha relies on `-webkit-sticky` and similar prefixes). Fix the dev-console "unknown prop" warnings as they show up. The side-by-side pass catches visual drift.
- **[Larger landing payload]** The landing page serialises all 159 enriched colors into its RSC payload. → About 40KB of JSON, which is acceptable. It's the same data alpha bundled into its JS.
- **[Duplicated data until cutover]** The swatch JSON and `assets/` exist in both apps. → Accepted for the alpha-to-beta transition. The cutover change deletes alpha.
- **[Root `build` change touches the live Netlify deploy]** → The only difference is the `--filter`, and alpha's output is the same. Check a Netlify deploy preview of this branch before merging.

## Migration Plan

1. Merge with beta deployed to its own Vercel project. Production stays on alpha/Netlify.
2. Verify beta on its `*.vercel.app` URL against the specs.
3. Cutover (a separate future change): point the production domain at Vercel, retire the Netlify site, delete `apps/sanzo-wada-alpha`, and restore the root `build` script to a beta-only form.

**Rollback:** before cutover there's nothing to roll back, because alpha is untouched. After cutover, point DNS back to Netlify.

## Open Questions

- What the Vercel project is called and which team it belongs to, and the production domain (decided at cutover). These don't affect the build.

## Verification Notes

These are the results of tasks 7.2–7.4, run against `next start` locally.

- **Routes:** `verify:routes` passes. All 509 page URLs and the 5 percent-encoded punctuated slugs return 200, and `/swatch/not-a-color`, `/combination/0`, `/combination/349` and `/combination/abc` return 404.
- **Style parity:**
  - **Method:** every element under `<main>` was fingerprinted on both apps, in the same tab so the viewport matched. Each fingerprint covered 31 computed style properties, the `::after` content and the leaf text.
  - **Pages:** `/` (swatch and list views), `/about`, three swatch pages (including `eugenia-red-|-a`) and combinations 1, 100 and 348.
  - **Widths:** 375px and 1024px (in a same-origin iframe), and 1440px.
  - **Result:** all fingerprints are identical, except the desktop list-view cell for Dull Violet Black (`M:100` vs `M:106`, intended).
- **Accepted differences:**
  - The Dull Violet Black CMYK correction above.
  - Below 1240px, the pre-rendered HTML shows the desktop menu labels and list columns until hydration. Alpha showed nothing at all until its JavaScript ran.
  - Unknown URLs return a 404 page, where alpha rendered a broken page.
- **Not automated:** the clipboard contents after copy-hex. The "<hex> Copied" notice and its 2.5s reset were checked with a real click. Reading the clipboard back needs a browser permission prompt, so the pasted value should be checked by hand.
