# Proposal

## Why

Beta derives each swatch's slug from its name at load time, using alpha's rule. That rule keeps punctuation, so seven of the 159 colors get URLs with `|`, `'` or `---` in them (for example `/swatch/eugenia-red-|-a` and `/swatch/hay's-russet`). The page and the route check need special decoding and encoding to handle them. Storing a clean slug with each color fixes the URLs and makes the slug part of the data instead of a side effect of the name. Beta isn't serving production yet, so now is the time to change its URLs.

The public JSON API (`/assets/colors.json`) is a separately maintained static file, and it has drifted from the data:
- It is missing two colors, Citrine and Chromium Green (157 colors instead of 159).
- It has stale combination lists for 13 colors.
- Every color after the first missing one has a shifted `index`.

Once slugs live in the data, the API should carry the same slugs as the pages.

## What Changes

- Add a required `slug` field to every color in beta's six swatch JSON files.
- Normalize slugs: lowercase letters, digits and single hyphens only. Apostrophes are dropped and any other run of punctuation or whitespace becomes one hyphen. The seven affected colors become:
  - Eugenia Red | A → `eugenia-red-a`
  - Eugenia Red | B → `eugenia-red-b`
  - Grayish Lavender - A → `grayish-lavender-a`
  - Grayish Lavender - B → `grayish-lavender-b`
  - Hay's Russet → `hays-russet`
  - Pale King's Blue → `pale-kings-blue`
  - Vandar Poel's Blue → `vandar-poels-blue`

  The other 152 slugs stay the same as alpha's.
- Validate slugs when the data loads. The build fails if a slug is missing, badly formed or duplicated.
- Look up swatches by the stored slug instead of one derived from the name. The swatch page no longer needs to decode slugs.
- **BREAKING (beta URLs):** the seven old punctuated swatch URLs no longer render a page. Each one permanently redirects to its new slug, in both its literal and percent-encoded forms, so alpha links keep working after the cutover.
- Generate beta's `/assets/colors.json` from the color library at build time instead of serving the static copy. As a result it:
  - has all 159 colors, including Citrine and Chromium Green;
  - uses the normalized slugs;
  - matches the pages' `index`, combination lists and other values;
  - keeps the same `{ "colors": [...] }` shape and field names.
- Alpha is not changed: its swatch JSON, slug function, routes and Netlify deploy all stay as they are.

## Capabilities

### New Capabilities
- `swatch-slugs`: covers the stored slug on each color, the normalization rules, load-time validation, and redirects from alpha's legacy punctuated slugs.

### Modified Capabilities
- `color-library`: the "Colors are enriched with derived values" requirement no longer derives `slug` from the name. Beta's values now match alpha's except for the seven normalized slugs. The "Slugs keep alpha's punctuation" scenario is replaced.
- `color-dictionary-app`: the "Routes match alpha" requirement now serves the normalized slugs and redirects the legacy punctuated ones, instead of serving them directly. The "Document metadata and static assets match alpha" requirement now serves a generated, complete `/assets/colors.json` instead of alpha's file.

## Impact

- `apps/sanzo-wada-beta/src/colors/`:
  - `swatches_{a..f}.json` gain a `slug` field.
  - `types.ts`: `RawColor` gains `slug`.
  - `parse.ts` validates the slug format.
  - `index.ts` checks slugs are unique.
  - `colors.ts` drops `returnSlug`.
- `apps/sanzo-wada-beta/src/app/swatch/[slug]/page.tsx`: the `decodeURIComponent` workaround is removed.
- `apps/sanzo-wada-beta/public/assets/colors.json` is removed. A new static route at `src/app/assets/colors.json/route.ts` serves the JSON instead.
- `apps/sanzo-wada-beta/next.config.ts` gets permanent redirects for the seven legacy slugs.
- `apps/sanzo-wada-beta/scripts/`:
  - `verify-colors.ts` allows the seven slug differences from alpha.
  - `verify-routes.ts` checks the new URLs and the legacy redirects.
- `CLAUDE.md`'s beta notes on slug decoding get updated.
- No new dependencies. Alpha and Netlify are unaffected.
