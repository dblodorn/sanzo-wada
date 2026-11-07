# Proposal

## Why

A swatch or combination link shared in Slack, iMessage, X or Bluesky unfurls to a bare title, because the pages have no `og:image` and every page has the same title and description. The colors are the whole point of the site, so a shared link should show them. The REST API and MCP server also give agents page URLs only, with no image they can show or attach.

## What Changes

- Each of the 159 swatches gets a 1200×630 PNG share card at `/swatch/<slug>/card.png`: the color filling the card, with its name, hex value and the book's title in the site's `fff` fonts.
- Each of the 348 combinations gets a card at `/combination/<n>/card.png`: its colors as side-by-side bars, as on the page, with "Combination <n>", the color names and their hex values.
- Every card is pre-rendered at build time with `next/og`, like the rest of the site. An unknown slug or number returns 404.
- Swatch and combination pages get Open Graph and Twitter metadata: a per-page `og:title` and `og:description`, `og:image` pointing to the page's card (with its width, height and alt text), and `twitter:card` set to `summary_large_image`. The `<title>` and meta description stay alpha's.
- Color and combination resources in the REST API, and so in the MCP tools and resources, gain a `card_url` field with the absolute URL of the card. This is additive and not breaking.
- `verify:routes` checks every card and the page metadata, and `verify:api` checks `card_url`.

Out of scope: cards for `/` and `/about`, cards for arbitrary palettes or hex values, and returning images inline from MCP tools.

## Capabilities

### New Capabilities
- `share-cards`: the card images for swatches and combinations (URLs, size, content, static generation, 404s), and the social metadata that points pages at them.

### Modified Capabilities
- `color-dictionary-app`: "Document metadata and static assets match alpha" changes. Swatch and combination pages add Open Graph and Twitter tags on top of alpha's title and description.
- `color-api`: "Consistent resource shapes" changes. Color and combination resources (including the colors inside a combination) gain `card_url`.

`color-mcp` needs no delta. Its tool results and resources must already equal the REST resources, so they gain `card_url` without a requirement change.

## Impact

- **New routes:**
  - `src/app/swatch/[slug]/card.png/route.tsx`
  - `src/app/combination/[n]/card.png/route.tsx`
  - shared card components and font loading under `src/cards/`
- **Changed pages:** `src/app/swatch/[slug]/page.tsx` and `src/app/combination/[n]/page.tsx` gain `generateMetadata`. `src/app/layout.tsx` sets `metadataBase`.
- **API:**
  - `src/api/schemas.ts` and `src/api/resources.ts` gain `card_url`.
  - The OpenAPI document picks it up from the schemas.
  - `/llms.txt` lists the card URL patterns.
- **Build:** 507 more static PNGs, rendered by `next/og` (bundled with Next, so no new dependency). This adds build time and a few tens of MB of output.
- **Checks:** `scripts/verify-routes.ts` and `scripts/verify-api.ts`.
- **Alpha:** unchanged.
