# Design

## Context

Beta pre-renders every page with `generateStaticParams` and `dynamicParams = false`.

It already has one static, file-like route handler, `src/app/assets/colors.json/route.ts`. It is generated once at build time and served as a file, which is the pattern the cards follow.

The site's fonts are `fff-Regular_gdi.woff` and `fff-RegularItalic_gdi.woff` in `public/assets/fonts/`.

**Swatch page text color:** the page picks its text color inline in `src/views/Swatch.tsx`:

```ts
chroma.contrast(hex, colors.grey) > 2 ? colors.grey : colors.black
```

**Metadata:** the root layout sets only `title` and `description`, and there is no `metadataBase`.

**API links:** API resources build their links from the request origin in `src/api/resources.ts`. MCP results reuse the same functions, so they stay identical to REST.

## Goals / Non-Goals

**Goals:**
- Cards are rendered once, at build time, by the same build that renders the pages, with no runtime image service.
- The card's colors and text colors come from the same color library and the same contrast rule as the pages, so a card never disagrees with its page.
- The `og:image` and `card_url` links are stable and readable, and they don't change between deploys.

**Non-Goals:**
- Cards for arbitrary hex values or palettes rendered on demand.
- Changing how any page looks.
- Returning image content from MCP tools. Agents get `card_url` to link to or fetch.

## Decisions

### 1. Explicit `card.png` route handlers, not the `opengraph-image` file convention

The cards are served by `src/app/swatch/[slug]/card.png/route.tsx` and `src/app/combination/[n]/card.png/route.tsx`. Each one:
- exports `generateStaticParams` (reusing `colorSlugs()` and `combinationNumbers()`), `dynamic = 'force-static'` and `dynamicParams = false`;
- returns `new ImageResponse(...)` from `next/og` at 1200 × 630.

**Alternative: the `opengraph-image.tsx` convention.** It would inject the `og:image` tags automatically. But it serves cards at `/swatch/<slug>/opengraph-image` with a build-hash query string, which is a poor URL to publish in the API as `card_url`, and it gives no `.png` extension for clients that sniff by name.

Explicit routes match the existing `assets/colors.json` pattern. The cost is writing the metadata by hand (Decision 4), which is a few lines.

### 2. Card markup in `src/cards/`

`src/cards/` holds the card markup, which pages and API code don't import:
- `SwatchCard.tsx` and `CombinationCard.tsx`: plain JSX with inline styles, as Satori requires. Every element with more than one child is `display: flex`.
- `fonts.ts`: reads the `fff` woff files with `readFile(join(process.cwd(), 'public/assets/fonts/…'))`. Satori accepts woff, but not woff2. Rendering only happens during the build, so the files don't need to be traced into a serverless function.
- `card.ts`: holds `CARD_SIZE`, the `og:image:alt` text builders and the card paths (`swatchCardPath(slug)`, `combinationCardPath(n)`). Pages, metadata and API resources all build card URLs from these one place.

**Card layout (1200 × 630, 60px margin):**
- **Swatch:** the color fills the card. The credit line is at the top left, in about 28px type. The name (about 96px) and hex (about 48px) are at the bottom left. The top-right corner is left clear.
- **Combination:** equal-width bars fill the card in library order, as the page shows them. "Combination <n>" and the credit line sit at the top of the first bar. Each bar has its color's name and hex at its bottom left, in that bar's text color. Names wrap within a bar, which matters at four bars (300px each).

### 3. One text-color rule

The page's contrast expression moves to a library function, `textColorOn(hex)`, in `src/styles/` next to the theme colors. `Swatch.tsx` calls it, and so do both cards. The page's output is unchanged; it is the same expression with the same theme values.

### 4. Metadata through `generateMetadata` and an explicit `metadataBase`

Both page files export `generateMetadata`. It returns `openGraph` (`title`, `description`, `url`, `images: [{ url, width, height, type, alt }]`) and `twitter: { card: 'summary_large_image' }`. It sets no `title` or `description`, so the layout's alpha values still apply.

The root layout sets `metadataBase` as follows:
- in Vercel production builds: `https://${VERCEL_PROJECT_PRODUCTION_URL}`;
- in preview builds: `https://${VERCEL_BRANCH_URL ?? VERCEL_URL}`;
- otherwise: `http://localhost:${PORT ?? 3000}`.

This mirrors Next's own fallback, made explicit so the build doesn't warn and the rule is visible. Pages are static, so the origin is baked in at build time. API `card_url` keeps using the request origin, like `url` and `api_url`.

### 5. Caching

Prerendered route output is served from Vercel's CDN. A `headers()` entry in `next.config.ts` for `/swatch/:slug/card.png` and `/combination/:n/card.png` sets `Cache-Control: public, max-age=31536000, immutable`. Cards only change on deploy, so browsers, unfurlers and Vercel's CDN may all keep them for a year. After a card redesign, cache-bust by adding a version query (for example `?v=2`) in `swatchCardPath` and `combinationCardPath`. `og:image`, `card_url` and `verify:routes` all build card URLs from those two functions, so they all follow. Static route output ignores the query.

### 6. API and MCP

In `src/api/schemas.ts`, `card_url: z.url().describe(...)` is added to the color schema, the combination color schema and the combination schema.

In `src/api/resources.ts`, `colorLinks` gains `card_url`, and `toCombinationResource` adds the combination's card. The changes flow from there:
- OpenAPI picks the field up from the schemas.
- MCP structured results gain it automatically.
- The MCP text summaries stay as they are.

`/llms.txt` gains the two card URL patterns in its page-URL section.

### 7. Verification

**`verify:routes`:**
- requests every card and checks:
  - status 200;
  - `image/png`;
  - a size of 1200 × 630, read from the PNG's IHDR chunk.
- for every swatch card, decodes the first scanline with `zlib` and checks that the top-right pixel equals the color's hex. This undoes the PNG row filter; for the first row, Up and Paeth reduce to simple cases.
- checks each page's `og:image`, `twitter:card` and unchanged `<title>`;
- checks the three 404 cases.

**`verify:api`:**
- expects `card_url` in every resource with the right value;
- requests a sample of `card_url`s.

## Risks / Trade-offs

- **[Risk] Next may not prerender a route handler nested under a dynamic page segment** (for example, it may treat it as dynamic). → The build output lists prerendered routes. Task 2 checks for `/swatch/[slug]/card.png` with 159 paths before going further. If it fails, fall back to the `opengraph-image` convention and serve `card_url` through a `next.config.ts` rewrite to it.
- **[Risk] Build time and size:** 507 Satori + resvg renders. Expect tens of seconds across the build workers. Flat color PNGs are small, so the output should be roughly 10–20 MB. → Measure in task 2. It is acceptable for a site that deploys rarely.
- **[Risk] The `fff` woff may lack glyphs** (for example, the em dash in the credit line). → If a glyph is missing, Satori falls back and logs it. Check the rendered cards, and use a plain hyphen if needed.
- **[Trade-off] `og:image` URLs are baked in at build time with the build's origin, while `card_url` follows the request origin.** In production both are `https://sanzo-wada.dmbk.io`. A preview deploy's pages point to that preview's cards, which is what you want when testing unfurls.
- **[Risk] Some unfurlers cache images by URL for a long time,** so an updated card design may not show for links shared before the update. → Accepted. A `?v=` query string can be added to `og:image` later if needed, without changing the specs.

## Migration Plan

This is additive.
1. Merge and deploy to production.
2. Run `verify:routes` and `verify:api` against https://sanzo-wada.dmbk.io.
3. Paste a swatch and a combination URL into a card validator to confirm the unfurl.

**Rollback:** revert the merge. No data or URLs depend on the cards existing, apart from the new API field.
