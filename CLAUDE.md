# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

An interactive web version of Sanzo Wada's *A Dictionary of Color Combinations* (348 combinations, 159 colors). There are two apps:
- `apps/sanzo-wada-alpha` is the original React SPA. It is what production serves today, from Netlify.
- `apps/sanzo-wada-beta` is a Next.js + TypeScript port with the same styling and behaviour, deployed to its own Vercel project.

Production will be cut over from alpha to beta once beta is ready. Until then, keep alpha working and don't change it as part of beta work.

## Commands

pnpm + Turborepo monorepo (`pnpm@8`, Node >= 20). The root `preinstall` enforces pnpm.

```sh
pnpm install
pnpm build                                     # install + turbo build of alpha only, then copies apps/sanzo-wada-alpha/dist to ./dist (what Netlify publishes)
pnpm dev:alpha                                 # webpack-dev-server with HMR (turbo, filtered to the app)
pnpm build:alpha                               # webpack production build into apps/sanzo-wada-alpha/dist/
pnpm dev:beta                                  # next dev for beta
pnpm build:beta                                # next build for beta (all pages pre-rendered)
pnpm --filter sanzo-wada-beta typecheck        # tsc --noEmit (strict)
pnpm --filter sanzo-wada-beta verify:colors    # beta's color library vs alpha's runtime color lists
pnpm --filter sanzo-wada-beta verify:routes http://localhost:3000   # all 509 page URLs, legacy slug redirects, /assets/colors.json and 404 cases against a running beta (after build + `pnpm start`)
pnpm clean
```

Every build script is filtered to one app. Don't add an unfiltered `turbo run build` to the Netlify path, because it would build beta too.

There are no tests and no lint script. Beta's checks are the typecheck and the two `verify:*` scripts. `packages/sw-eslint-config` is scaffolding that nothing uses yet. Beta's `tsconfig.json` extends `packages/sw-tsconfig` (`@sw/tsconfig/base.json`). Formatting is Prettier (`.prettierrc`: no semicolons, single quotes, width 90, es5 trailing commas). The `lint-staged` config in the root `package.json` runs it on commit through husky.

Netlify (`netlify.toml`) runs `npm run build` and publishes `dist/`, with a catch-all rewrite to `/index.html` for client-side routing.

## Architecture (`apps/sanzo-wada-alpha`)

The app is legacy-style React. It runs React 18 but still uses `ReactDOM.render`, class components and `componentWillMount`, with Redux 4, `connected-react-router` 4, react-router 4 and styled-components 3. Babel 6 is configured in the app's `package.json` (presets `env`, `react`, `stage-2`). Webpack 5 is set up in `webpack.config.js`, which copies `assets/**` into the output so they're served at `/assets/...`.

**Color data flow.** This is the main thing to understand:
1. The source data is `src/colors/swatches_{a..f}.json`. Each color has `name`, `cmyk` (as 0–100 values) and `combinations`, a list of combination numbers 1–348 that the color appears in. The six files match the six groups of the swatch view.
2. `src/colors/colors.js` enriches each color at runtime. It uses chroma-js to convert CMYK to hex and RGB, builds a `slug` from the name, and adds `index` and `use_count`.
3. `src/colors/swatches.js` exports `swatchArray` (an array of the six groups, `{ swatches: [...] }`) and `swatchArrayAll` (one flat list).
4. The `colorData()` action, dispatched once in `src/index.js`, puts both into the store as `state.color_data.color_list` and `color_list_flat`.

Combinations are never stored directly. A combination is derived by finding every color whose `combinations` array contains that number (`src/components/HOC/comboData.js`).

**Routing and HOCs.** The routes in `src/Routes.js` are `/`, `/about`, `/swatch/:slug` and `/combination/:n`. The views don't use route params. The HOCs in `src/components/HOC/` read `state.router.location.pathname` from the store, parse the slug out of it and look up the data:
- `swatchData` finds a color by `slug`.
- `comboData` collects the colors in a combination.
- `withStore` passes the whole store state through as props.

The view on `/combination/:n` hardcodes `348` as the last combination for its prev/next links.

**`assets/colors.json` is a static, separately maintained file.** The Landing page links to it as the public "JSON API". It holds precomputed hex and RGB values, and they don't necessarily match what the app computes at runtime. If you edit the swatch JSON, this file won't update on its own.

**Styling.** The design tokens are in `src/styles/theme.json`: colors, spacing, `shared.nav_height` and `breakpoints`. Shared styled-components and mixins such as `flexRow` and `media.small` come from `src/styles/index.js`. Window size is kept in Redux (`resize_state`, throttled), and components read it for responsive labels. The custom fonts (`fff-regular`, `fff-italic`) load through webfontloader from `assets/fonts.css`, and `fonts_loaded` is set in the store once they're ready.

## Architecture (`apps/sanzo-wada-beta`)

Next.js 16 App Router, React 19, styled-components 6, strict TypeScript. The port is deliberately one-to-one: each alpha component and view has a counterpart with the same name and the same styled-component CSS. When changing styling, keep the two comparable until the cutover.

**Static rendering.** Every page is pre-rendered at build time. `src/app/swatch/[slug]/page.tsx` and `src/app/combination/[n]/page.tsx` use `generateStaticParams` with `dynamicParams = false`, so an unknown slug or number is a real 404 (`src/app/not-found.tsx`). Pages are server components: they look up data in the color library and pass it as props to the `'use client'` views in `src/views/`. There is no Redux and no runtime data fetching. `next.config.ts` permanently redirects alpha's seven punctuated swatch URLs (for example `/swatch/hay's-russet`, typed or percent-encoded) to the normalized slugs listed in `src/colors/legacySlugs.ts`. `src/app/assets/colors.json/route.ts` generates the public JSON API from `allColors` at build time, as a static file.

**Color library (`src/colors/`).**
- `types.ts`: `RawColor`, `Color` (alpha's snake_case fields), `SwatchGroup`, `Combination`.
- `parse.ts`: validates the JSON at load. Each color needs a `slug` of lowercase letters, digits and single hyphens, and CMYK must be four values from 0 to 100, so a bad edit fails the build. `index.ts` also fails the build on a duplicate slug.
- `colors.ts`: the enrichment, with the same algorithm as alpha, except that the slug comes from the JSON rather than from the name. chroma-js 3 gives output identical to alpha's 1.4.1.
- `index.ts`: exports `swatchGroups` (index restarts per group), `allColors` (index 1–159), `getColorBySlug`, `getCombination` and `COMBINATION_COUNT`.

Beta's swatch JSON differs from alpha's in two ways:
- every color has a stored `slug`. Seven of them are normalized away from alpha's punctuated slugs (`eugenia-red-a`, not `eugenia-red-|-a`).
- Dull Violet Black's magenta is 100 (alpha has 106).

`verify:colors` allows only those differences. When adding a color, write its slug by hand: lowercase the name, drop apostrophes, and turn each other run of punctuation or spaces into one hyphen.

**Styling.**
- `src/styles/index.ts` and `theme.json` are ported from alpha. Custom style props are transient (`$hex`, `$hexVal`), and chroma colors are interpolated with `.hex()`.
- `src/lib/registry.tsx` collects styled-components CSS into the pre-rendered HTML, with `enableVendorPrefixes` to match v3's output.
- `src/Document.tsx` holds the global CSS (`createGlobalStyle`) and the `Main` wrapper.
- Fonts load from `/assets/fonts.css`, linked in `src/app/layout.tsx`.
- `public/assets/` is a copy of alpha's `assets/`, except `colors.json`, which is generated (see Static rendering).

**Window size.** `src/state/WindowSize.tsx` holds a context with a 50ms throttle. The first render uses width 1240 (desktop), so the server and client HTML match on hydration. The real width is set after mount.

**Deploy.** This is a separate Vercel project with its root directory set to `apps/sanzo-wada-beta`. Beta has no Netlify config.
