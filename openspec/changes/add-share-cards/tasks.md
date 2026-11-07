# Tasks

## 1. Shared pieces

- [x] 1.1 On a new branch, move the swatch page's contrast rule into `textColorOn(hex)` in `src/styles/` and use it in `src/views/Swatch.tsx`. Verify with these checks:
  - `typecheck` passes.
  - The pre-rendered HTML for `/swatch/hermosa-pink` and for a dark swatch has the same CSS as before (diff `.next/server/app/swatch/*.html` before and after).
- [x] 1.2 Add `src/cards/card.ts`, holding:
  - `CARD_SIZE` (1200 × 630)
  - `swatchCardPath(slug)` and `combinationCardPath(n)`
  - the `og:image:alt` builders and the `og:description` builders

  Add `src/cards/fonts.ts`, which loads the `fff` woff files from `public/assets/fonts/`. Verify that `typecheck` passes and that a scratch `tsx` run prints the expected paths and alt text for `hermosa-pink` and combination 1.

## 2. Card routes

- [x] 2.1 Write `src/cards/SwatchCard.tsx` and `src/app/swatch/[slug]/card.png/route.tsx` with these exports:
  - `generateStaticParams` from `colorSlugs()`
  - `dynamic = 'force-static'`
  - `dynamicParams = false`
  - a `GET` that returns an `ImageResponse` laid out as in design decision 2

  Verify with these checks:
  - `pnpm build:beta` lists `/swatch/[slug]/card.png` as prerendered with 159 paths. If it doesn't, stop and apply the fallback in the design's first risk.
  - `curl -I` against `pnpm start` gives 200 and `image/png` for `hermosa-pink`, and 404 for `not-a-color` and `hay's-russet`.
- [x] 2.2 Write `src/cards/CombinationCard.tsx` and `src/app/combination/[n]/card.png/route.tsx` the same way. Verify with these checks:
  - The build lists 348 paths.
  - `curl` gives 200 and `image/png` for `/combination/1/card.png` and `/combination/348/card.png`.
  - `curl` gives 404 for `/combination/0/card.png` and `/combination/349/card.png`.
- [x] 2.3 Look at the rendered cards and check that the text is legible and that names wrap inside their bar. Use these cards:
  - Hermosa Pink
  - the darkest color
  - the lightest color
  - combination 1
  - a four-color combination with long names

  Check that the em dash and every color name render in `fff` with no missing glyphs (check the build log for Satori glyph warnings). Note the build time and the total card output size against the design's estimate.
- [x] 2.4 Add the `Cache-Control` `headers()` entries for both card paths to `next.config.ts`, keeping the existing headers and redirects. Verify with `curl -I` that a card returns `public, max-age=31536000, immutable`.

## 3. Page metadata

- [x] 3.1 Set `metadataBase` in `src/app/layout.tsx` from the Vercel environment variables, falling back to localhost (design decision 4). Verify that `typecheck` passes and the build prints no `metadataBase` warning.
- [x] 3.2 Add `generateMetadata` to `src/app/swatch/[slug]/page.tsx` and `src/app/combination/[n]/page.tsx`, filling the `openGraph` and `twitter` fields from the `share-cards` spec. Verify with these checks:
  - The HTML for `/swatch/hermosa-pink` contains the `og:image`, `og:image:width`, `og:image:height`, `og:image:type`, `og:image:alt`, `og:title` (`Hermosa Pink | Wada Sanzo`), `og:description`, `og:url` and `twitter:card` tags.
  - Its `<title>` and meta description are unchanged.
  - The same holds for `/combination/1`.

## 4. API, MCP and llms.txt

- [x] 4.1 Add `card_url` to the color, combination-color and combination schemas in `src/api/schemas.ts`. Add it to `colorLinks` and `toCombinationResource` in `src/api/resources.ts`, using the paths from `src/cards/card.ts`. Verify with these checks:
  - `typecheck` passes.
  - `/api/v1/colors/hermosa-pink` and `/api/v1/combinations/1` return the expected `card_url` values.
  - `/api/v1/openapi.json` shows `card_url` in the `Color` and `Combination` components.
- [x] 4.2 Add the two card URL patterns to `/llms.txt`'s page-URL section. Verify that `curl /llms.txt` shows them as absolute URLs.

## 5. Verification scripts

- [x] 5.1 Extend `scripts/verify-routes.ts` with these checks:
  - all 507 cards have status 200, `image/png` and an IHDR size of 1200 × 630;
  - each swatch card's top-right pixel, decoded from the first scanline with `zlib`, equals the color's hex;
  - the 404 card cases;
  - every swatch and combination page has an `og:image` that equals its card URL on the base URL being verified, `twitter:card` set to `summary_large_image`, and the unchanged `<title>`.

  Verify that it passes against `pnpm start`, and that it fails when one card's background is deliberately broken.
- [x] 5.2 Extend `scripts/verify-api.ts` so that:
  - every color, combination-color and combination resource has the expected `card_url`;
  - the "color list matches public JSON" check allows `card_url`;
  - a sample of `card_url`s resolves to `image/png`;
  - MCP results still equal the REST responses.

  Verify that `verify:api` passes against `pnpm start`.
- [x] 5.3 Run the full set of checks against a fresh `pnpm build:beta` and `pnpm start`, and verify that all of them pass:
  - `typecheck`
  - `verify:colors`
  - `verify:routes`
  - `verify:api`

## 6. Docs and release

- [x] 6.1 Update `CLAUDE.md` (the beta architecture section): describe the card routes, `src/cards/`, `metadataBase` and `card_url`. Update the `verify:routes` and `verify:api` command descriptions. Verify that the text matches the code.
- [ ] 6.2 Open a PR. After it is merged and deployed, run `verify:routes` and `verify:api` against `https://sanzo-wada.dmbk.io` and check that both pass. Also check that a swatch URL and a combination URL unfurl with their cards in a link-preview validator.
