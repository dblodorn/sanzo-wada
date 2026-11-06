# Proposal

## Why

`sanzo-wada-alpha` runs on an aging stack: Babel 6, `ReactDOM.render`, react-router 4, `connected-react-router` and styled-components 3. Most of it can't be upgraded in place, and the code has no types. A Next.js + TypeScript port in a new `apps/sanzo-wada-beta` gives the app a maintained framework and typed color data. Alpha stays untouched, so the port can be checked against it before anything is switched over.

## What Changes

- Add a new Next.js app at `apps/sanzo-wada-beta` (pnpm workspace package `sanzo-wada-beta`), written in TypeScript.
- Port every alpha route with the same URLs and behaviour: `/`, `/about`, `/swatch/[slug]` and `/combination/[n]` (1–348, with prev/next links).
- Render every page statically at build time, since the data set is fixed. All 159 swatch pages and 348 combination pages are generated up front from the color library (`generateStaticParams`, with `dynamicParams = false`), so a slug or number outside the data set returns a 404. Beta has no server rendering at request time and no runtime data fetching. Only behaviour that depends on the browser (window size, font loading, copy-to-clipboard, the swatch/list view toggle) runs on the client, after hydration.
- Keep the styling the same. Port the styled-components, the global CSS, the `theme.json` tokens, the mixins and the `fff-regular` / `fff-italic` fonts, so beta looks the same as alpha at every breakpoint.
- Keep the JS behaviour the same. Port the existing logic (CMYK → hex/RGB via chroma-js, slug generation, deriving combinations, copy-hex, swatch/list view toggle, responsive labels). Dependencies alpha installs but never uses (`react-autocomplete`, `react-url-query`, `react-scroll`, `react-hot-loader`) are not carried over as it is, without redesigning it.
- Add a typed color library. Types for the raw swatch JSON (`name`, `cmyk`, `combinations`), the enriched color (`index`, `slug`, `hex`, `rgb`, `rgb_array`, `cmyk`, `cmyk_array`, `use_count`), swatch groups and combinations. The functions that build and look up colors get typed signatures.
- Serve `/assets/...` (fonts, `colors.json`, other static files) from beta's `public/` at the same paths, so the public "JSON API" link keeps working.
- Replace Redux with React state. The app-wide values alpha keeps in the store (color data, window size, fonts loaded) move to React state and context. Next.js routing replaces `connected-react-router` and react-router, so views read route params directly instead of parsing `state.router.location.pathname`. Redux, `react-redux`, `redux-thunk`, `connected-react-router` and react-router are not dependencies of beta.
- Target builds to one app each. Add root scripts `dev:beta` / `build:beta`, and change the root `build` script to build only alpha (`turbo run build --filter=sanzo-wada-alpha`), so the Netlify deploy never builds beta and the Vercel deploy never builds alpha.
- Deploy beta to a new Vercel project rooted at `apps/sanzo-wada-beta`. Beta has no Netlify config.
- Alpha is not modified or removed, and Netlify keeps publishing it until the cutover. The cutover itself (moving the production domain to Vercel and retiring the Netlify site) happens later, once beta is ready, and is not part of this change.

## Capabilities

### New Capabilities

- `color-library`: a typed Sanzo Wada color dataset. It loads the six swatch groups, enriches each color (hex, RGB, CMYK strings, slug, index, use count) and looks up colors by slug and combinations by number (1–348).
- `color-dictionary-app`: the user-facing beta app. It covers the routes (landing/swatch grid, about, swatch detail, combination detail with prev/next), the swatch/list view toggle, copy-hex, the responsive layout and font loading, all matching alpha.

### Modified Capabilities

None. `openspec/specs/` has no existing specs.

## Impact

- **New code:** `apps/sanzo-wada-beta/` (Next.js, TypeScript, `tsconfig.json`, `next.config`). It may build on `packages/sw-tsconfig`, which is unused today.
- **Dependencies:** adds `next`, `typescript` and `@types/*`, plus a styled-components version that works with Next.js (v3 has no Next.js integration, so the CSS is kept but the library version changes). Redux, `react-redux`, `redux-thunk`, `connected-react-router`, `history` and react-router are dropped for beta.
- **Root tooling:** root `package.json` gets `dev:beta` / `build:beta`, and the root `build` is filtered to alpha. `turbo.json` `build.outputs` gets `.next/**` (excluding `.next/cache/**`) next to `dist/**`.
- **Data:** the swatch JSON is copied into beta with one correction: "Dull Violet Black" has CMYK `[95, 106, 38, 50]` in the source, and magenta becomes 100. Its hex is unchanged (`#06004f`), but the list view shows `M:100` instead of alpha's `M:106`. Alpha's copy and `assets/colors.json` keep 106. Color enrichment (chroma-js CMYK → hex/RGB) runs at build time while pages are generated, so the hex values in the static HTML are the same ones alpha computes at runtime. `assets/colors.json` stays a separately maintained static file.
- **Deployment:** a new Vercel project for beta, with its root directory set to `apps/sanzo-wada-beta`, pnpm installs from the monorepo root, and preview deploys on branches. `netlify.toml` and the alpha site are unchanged. The cutover to Vercel comes later in a separate change.
