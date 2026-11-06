# Tasks

## 1. Scaffold the beta app

- [x] 1.1 Create `apps/sanzo-wada-beta/package.json` (`name: "sanzo-wada-beta"`, scripts `dev`/`build`/`start`/`typecheck`). Dependencies: `next@16`, `react@19`, `react-dom@19`, `styled-components@6`, `chroma-js@3.2.0`, `lodash`, `react-copy-to-clipboard`, `@sw/tsconfig` (workspace). Dev dependencies: `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `@types/lodash`, `@types/react-copy-to-clipboard`. Verify `pnpm install` at the root succeeds and `pnpm ls --filter sanzo-wada-beta` lists them.
- [x] 1.2 Add `tsconfig.json` extending `@sw/tsconfig/base.json` (strict), with Next's options (`moduleResolution: "bundler"`, `jsx: "preserve"`, `resolveJsonModule`, the `next` plugin, `@/*` → `src/*`) and `next-env.d.ts`. Verify `pnpm --filter sanzo-wada-beta typecheck` runs.
- [x] 1.3 Add `next.config.ts` with `compiler.styledComponents: true`. Add a minimal `src/app/layout.tsx` and `src/app/page.tsx`. Verify `pnpm --filter sanzo-wada-beta build` succeeds and `next dev` serves `/`.
- [x] 1.4 Copy `apps/sanzo-wada-alpha/assets/` unchanged to `apps/sanzo-wada-beta/public/assets/`. Verify `/assets/colors.json`, `/assets/fonts.css` and `/assets/fonts/fff-Regular_gdi.woff` return 200 from `next dev`, and that `colors.json` is byte-identical to alpha's (`cmp`).
- [x] 1.5 Add `.gitignore` entries for `.next/` and `next-env.d.ts` as needed. Verify `git status` shows no build output after a build.

## 2. Typed color library

- [x] 2.1 Copy the six `swatches_{a..f}.json` files into `apps/sanzo-wada-beta/src/colors/`, correcting Dull Violet Black's CMYK `[95, 106, 38, 50]` → `[95, 100, 38, 50]` in `swatches_d.json`. Verify with `diff` against alpha's copies that this one line is the only difference.
- [x] 2.2 Write `src/colors/types.ts` (`CMYK`, `RGB` tuples, `RawColor`, `Color`, `SwatchGroup`, `CombinationColor`, `Combination`) as described in design.md, Decision 5. Verify it passes `typecheck`.
- [x] 2.3 Write `parseRawColors()`: it checks each entry has a string name, four CMYK numbers from 0 to 100 and integer combination numbers, and returns `RawColor[]`. Verify that temporarily corrupting one `cmyk` value in a JSON copy makes `next build` fail with a message naming the color, then revert.
- [x] 2.4 Port `colors.js` to `src/colors/colors.ts`: same CMYK/100 → `chroma.cmyk` → hex/RGB algorithm, slug regex and string formats, using native array methods instead of the lodash mixins. Verify it passes `typecheck`.
- [x] 2.5 Write `src/colors/index.ts` exporting `swatchGroups`, `allColors`, `getColorBySlug`, `getCombination`, `colorSlugs`, `combinationNumbers` and `COMBINATION_COUNT = 348`. Combinations are derived in flat order. Verify it passes `typecheck`, and that a quick script prints 159 slugs, 348 combination numbers, and `getCombination(0)` / `getCombination(349)` returning `undefined`.
- [x] 2.6 Write `scripts/verify-colors.ts`, which loads alpha's `colors.js` + JSON and beta's library and deep-compares every field of `swatchGroups` vs `swatchArray`, `allColors` vs `swatchArrayAll`, and each combination 1–348 vs alpha's `comboData` filter. Verify it passes, with Dull Violet Black's `cmyk`/`cmyk_array` as the only allowed difference (run with `tsx`).

## 3. Styling foundation

- [x] 3.1 Copy `theme.json` unchanged to `src/styles/theme.json`. Port `styles/index.js` to `src/styles/index.ts`: same CSS text, typed `media.small`/`media.medium` tagged-template helpers, `keyframes`/`css` helpers, and styled `next/link` for `SwatchLink`/`ComboLink`/`ButtonLink`/`SmallLink`, with `$hex` transient props. Verify it passes `typecheck`.
- [x] 3.2 Add `src/lib/registry.tsx` (the styled-components App Router registry using `useServerInsertedHTML` + `ServerStyleSheet`) with a `StyleSheetManager` that has `enableVendorPrefixes`. Verify the pre-built HTML for `/` contains a `<style data-styled>` block that includes `-webkit-sticky`.
- [x] 3.3 Port `Document.js`'s `injectGlobal` to a `GlobalStyle` built with `createGlobalStyle` (same CSS text) and its `Main` wrapper. Render both in the root layout. Verify with `curl` that the root font-size rules (58% / 62.5% / 72.5% / 78.5%) appear in the built `/` HTML.
- [x] 3.4 Root layout: `<link rel="stylesheet" href="/assets/fonts.css">` in `<head>`, `metadata` (alpha's title and description), `viewport` (`width=device-width, initial-scale=1, user-scalable=no`) and a white body background. Verify the `<title>`, description meta and viewport meta in the built HTML match alpha's `index.html`, and that the fff fonts load in the browser's network tab.

## 4. Client state

- [x] 4.1 Add a `WindowSizeProvider` client context (`window_width`/`window_height`, default width 1240 for the first render, real size set in `useEffect`, `lodash/throttle` 50ms resize listener removed on unmount) and mount it in the root layout. Verify that resizing the window updates a temporary debug readout and that the console shows no hydration warning.

## 5. Port components and views

- [x] 5.1 Port `Title`, `SwatchHeader`, `SwatchWrapper`, `ColorSwatches` and `ColorTable` to typed `'use client'` `.tsx` components with the same styled templates (`hex` → `$hex`). `ColorTable` reads the breakpoint from `WindowSizeProvider`. Verify they pass `typecheck`, with no "unknown prop" warnings in the dev console.
- [x] 5.2 Port `CopyHex` to a function component (`useState` + timer cleared on unmount, `react-copy-to-clipboard`, same `:after` notice and `animationFadeUp(1150, 15)`, `$hexVal`). Verify that clicking a hex in dev copies it (paste-check) and shows the "<hex> Copied" notice, which resets after 2.5s.
- [x] 5.3 Port the `Landing` view (local `table` toggle, responsive labels from `WindowSizeProvider`, JSON link to `/assets/colors.json`, ABOUT link) and `app/page.tsx`, which passes `swatchGroups` and `allColors`. Verify in dev: swatch view by default with six "SWATCH COLLECTION n" sections, the toggle switches views and marks the active button, and labels and list columns change across 1240px on resize.
- [x] 5.4 Port the `About` view and `app/about/page.tsx` with the same biography HTML (including `lang="ja-jp"` spans) and Colophon. Verify the text matches alpha's `About.js` (diff the extracted copy strings).
- [x] 5.5 Port the `Swatch` view and `app/swatch/[slug]/page.tsx`: `generateStaticParams` from `colorSlugs()`, `dynamicParams = false`, `decodeURIComponent` before `getColorBySlug`, `notFound()` when nothing is found. Keep the contrast-based text color. Verify `/swatch/hermosa-pink` shows links to 176, 227 and 273 on its color, and `/swatch/eugenia-red-|-a` resolves in dev.
- [x] 5.6 Port the `Combination` view and `app/combination/[n]/page.tsx`: `generateStaticParams` from `combinationNumbers()`, `dynamicParams = false`, integer parsing, `notFound()` for invalid numbers, Prev hidden at 1 and Next hidden at `COMBINATION_COUNT`. Verify `/combination/1`, `/combination/100` and `/combination/348` show the right Prev/Next links and color bars.
- [x] 5.7 Add `app/not-found.tsx`, styled with the existing header and title. Verify `/swatch/not-a-color` shows it in dev.
- [x] 5.8 Check that client-side navigation scrolls to the top. Verify that clicking a swatch tile after scrolling the landing page opens the swatch page at the top.

## 6. Build targeting and repo tooling

- [x] 6.1 Update the root `package.json`: `build` → `pnpm install && turbo run build --filter=sanzo-wada-alpha && cp -r apps/sanzo-wada-alpha/dist .`, and add `dev:beta` / `build:beta`. Verify `pnpm build` builds only alpha (turbo's summary lists one package) and produces `./dist`, and `pnpm build:beta` builds only beta.
- [x] 6.2 Update `turbo.json` `build.outputs` to `["dist/**", ".next/**", "!.next/cache/**"]`. Verify a second `pnpm build:beta` is a turbo cache hit.
- [x] 6.3 Update the repo `CLAUDE.md` to describe the beta app (commands, App Router layout, color library, Vercel deploy) alongside alpha. Verify the commands it lists run.

## 7. Verification

- [x] 7.1 Run `pnpm --filter sanzo-wada-beta typecheck` and `pnpm build:beta`. Verify both pass and the build output lists 509 pre-built routes plus `/_not-found`, all marked static.
- [x] 7.2 Write `scripts/verify-routes.ts` and run it against `next start`. It checks that all 509 URLs return 200 (the five punctuated slugs both literal and percent-encoded) and that `/swatch/not-a-color`, `/combination/0` and `/combination/349` return 404. Verify the script exits 0.
- [x] 7.3 With JavaScript disabled, load `/`, `/swatch/hermosa-pink` and `/combination/100` from `next start`. Verify the content, links and color backgrounds are present and styled.
- [x] 7.4 Compare alpha (`pnpm dev:alpha`) and beta (`next start`) side by side at 375px, 1024px and 1440px on `/`, the list view, `/about`, a swatch, combinations 1/100/348 and the copy-hex notice. Verify there are no visible differences once fonts have loaded, and record any accepted differences (for example, the desktop-label flash before hydration) in this change.

## 8. Vercel deployment

- [ ] 8.1 Create the Vercel project (after confirming its name and team with the user): link it to this repository, set Root Directory to `apps/sanzo-wada-beta`, framework Next.js, build command `turbo run build --filter=sanzo-wada-beta`, and ignored build step `npx turbo-ignore`. Verify the first preview deployment succeeds.
- [ ] 8.2 Re-run `verify-routes.ts` against the preview deployment URL. Verify it exits 0 and the 404 cases return 404 from Vercel.
- [ ] 8.3 Push a commit that only touches `apps/sanzo-wada-alpha` and confirm the Vercel build is skipped by `turbo-ignore`. Verify that a Netlify deploy preview of this branch still publishes alpha unchanged.
