# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

An interactive web version of Sanzo Wada's *A Dictionary of Color Combinations* (348 combinations, 159 colors). Deployed to Netlify as a static SPA.

## Commands

pnpm + Turborepo monorepo (`pnpm@8`, Node >= 20). The root `preinstall` enforces pnpm.

```sh
pnpm install
pnpm build                                     # install + turbo build, then copies apps/sanzo-wada-alpha/dist to ./dist (what Netlify publishes)
pnpm dev:alpha                                 # webpack-dev-server with HMR (turbo, filtered to the app)
pnpm build:alpha                               # webpack production build into apps/sanzo-wada-alpha/dist/
pnpm clean
```

There are no tests and no lint script. `packages/sw-eslint-config` and `packages/sw-tsconfig` are scaffolding that the app doesn't use yet. Formatting is Prettier (`.prettierrc`: no semicolons, single quotes, width 90, es5 trailing commas). The `lint-staged` config in the root `package.json` runs it on commit through husky.

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
