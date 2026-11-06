# Tasks

## 1. Swatch data

- [x] 1.1 Add a `slug` field after `name` to every entry in `apps/sanzo-wada-beta/src/colors/swatches_{a..f}.json`, using the normalization in design.md Decision 1. Verify that:
  - all 159 entries have a slug;
  - exactly seven slugs differ from alpha's `returnSlug(name)`, and they're the seven listed in the `swatch-slugs` spec;
  - `git diff` shows only added `slug` lines;
  - no file under `apps/sanzo-wada-alpha/` changed.
- [x] 1.2 Add `src/colors/legacySlugs.ts`, which maps the seven alpha slugs to their normalized slugs. Verify that each target exists in the JSON.

## 2. Color library

- [x] 2.1 Add `readonly slug: string` to `RawColor` in `types.ts`. In `parse.ts`, require a slug matching `^[a-z0-9]+(-[a-z0-9]+)*$` and name the group, color and value on failure. Verify by temporarily breaking one slug (`Hays-Russet`, then deleting it): `pnpm --filter sanzo-wada-beta typecheck` passes and the build fails with the expected message each time.
- [x] 2.2 In `colors.ts`, use `e.slug` and remove `returnSlug`. In `index.ts`, throw on a duplicate slug while building `colorsBySlug`, naming both colors. Verify by temporarily duplicating a slug: the build fails and names both colors.
- [x] 2.3 Remove `decodeURIComponent` from `src/app/swatch/[slug]/page.tsx`. Verify that `/swatch/hays-russet` renders under `pnpm dev:beta`.

## 3. Routes and public JSON

- [x] 3.1 Add permanent `redirects()` to `next.config.ts` for the seven legacy slugs, built from `legacySlugs.ts`. Verify with `curl -sI` against `pnpm start` that the literal and percent-encoded forms of each give a 308 to the normalized URL. If either form doesn't match, use the middleware fallback from design.md Decision 3.
- [x] 3.2 Delete `public/assets/colors.json`. Add `src/app/assets/colors.json/route.ts` (force-static, `{ colors: allColors }`). Verify that:
  - `pnpm build:beta` lists `/assets/colors.json` as static;
  - the served JSON has 159 entries, including Citrine (index 72) and Chromium Green (index 98);
  - the content type is `application/json`.

## 4. Verification scripts and docs

- [x] 4.1 Update `scripts/verify-colors.ts` so it allows `slug` differences only for the seven legacy-mapped colors, including in the combination check. Verify that `pnpm --filter sanzo-wada-beta verify:colors` passes and reports eight allowed colors.
- [x] 4.2 Update `scripts/verify-routes.ts`:
  - drop the punctuated-slug encoding;
  - check both forms of all seven legacy redirects;
  - check that `/assets/colors.json` deep-equals `allColors`.

  Verify that `verify:routes http://localhost:3000` passes after `pnpm build:beta && pnpm start`.
- [x] 4.3 Update the beta section of `CLAUDE.md`:
  - slugs are stored and validated;
  - legacy redirects exist;
  - `colors.json` is generated;
  - remove the `decodeURIComponent` note.

  Verify by reading the updated section.

## 5. Final checks

- [x] 5.1 Run `pnpm --filter sanzo-wada-beta typecheck`, `pnpm build:beta`, `verify:colors` and `verify:routes`, and confirm they all pass. Also confirm `pnpm build` (alpha/Netlify) still succeeds and `git diff --stat apps/sanzo-wada-alpha` is empty.
