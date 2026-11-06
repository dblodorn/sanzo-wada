# Design

## Context

Beta's color library (`apps/sanzo-wada-beta/src/colors/`) works like this today:
- It reads six swatch JSON files that are copies of alpha's.
- `parse.ts` checks each entry's shape.
- `colors.ts` derives `slug` from the name with alpha's `returnSlug`. That rule removes the first `/`, turns whitespace into hyphens and lowercases the result.
- The swatch page pre-renders every slug from `colorSlugs()`, and it calls `decodeURIComponent` before lookup so that the punctuated slugs resolve.
- `verify-colors` compares every field with alpha's runtime lists.
- `verify-routes` requests each slug both literally and percent-encoded.

`public/assets/colors.json` is a byte-for-byte copy of alpha's hand-maintained file. It has 157 colors, while the library has 159.

Alpha must not change (see proposal.md). The proposal also covers why the slugs are changing.

## Goals / Non-Goals

**Goals:**
- Make the slug data that is checked at load time, instead of a value computed from the name.
- Make all 159 swatch URLs plain `[a-z0-9-]`.
- Keep alpha's seven old URLs reachable.
- Make `/assets/colors.json` complete and consistent with the pages.

**Non-Goals:**
- Renaming colors. Some names have small errors, such as "Mars Brown Tobacco", which the old JSON gives as "Mars Brown / Tobacco". Changing a name is a separate data edit.
- Changing alpha's JSON, its `/assets/colors.json`, or its routes.
- Any change to combination pages, or to values other than `slug` (Dull Violet Black stays as it is).

## Decisions

### 1. Write `slug` into the JSON once, then treat the JSON as the source of truth

A one-off script adds `slug` to each entry in beta's six `swatches_*.json` files, straight after `name`. Each slug is normalized from the name: lowercase it, remove `'`, collapse each run of non-`[a-z0-9]` characters to `-`, and trim hyphens from the ends. After that, the build only reads and validates the stored slug and never computes one. This is what makes the slug stable: renaming a color later won't move its URL unless someone edits the slug on purpose.

*Alternative:* keep deriving slugs, using a better normalizer. That was rejected because the slug would still change whenever a name changes, and the request is for a stored field.

*Alternative:* check at build time that each slug equals `normalize(name)`. That was rejected because it would make the stored field redundant. Format and uniqueness checks are enough.

### 2. Validate format in `parse.ts`, uniqueness in `index.ts`

`parse.ts` already validates each entry. It will also require `slug` to be a string matching `^[a-z0-9]+(-[a-z0-9]+)*$`, and its error message names the group, the color and the bad value.

Uniqueness has to be checked across groups, so it goes in `index.ts`, where `colorsBySlug` is built. Building that map will throw on a duplicate and name both colors.

`RawColor` gains `readonly slug: string`. `colors.ts` copies `e.slug` and drops `returnSlug`, which nothing else uses.

### 3. Legacy slugs redirect from `next.config.ts`

Next's `redirects()` gets seven entries, each `permanent: true`, which gives a 308. They can't live in the page: `dynamicParams = false`, so an unknown slug 404s before the page code runs, and pre-rendering extra pages only to redirect from them would add redirect stubs to the static output.

Redirect sources are matched against the raw request path, so a literal source doesn't catch `%7C` or `%27`. Each legacy slug is therefore listed in three spellings: as typed, percent-encoded with uppercase hex, and percent-encoded with lowercase hex. Duplicate spellings are dropped. Testing confirmed this gives a 308 for every form, so no proxy/middleware was needed. A proxy would have run on every swatch request.

The map lives in one module, `src/colors/legacySlugs.ts`, which both the config and verify-routes import.

*Alternative:* serve both slugs with 200. That was rejected because it creates duplicate content and keeps the punctuated URLs alive.

### 4. Generate `/assets/colors.json` with a static route handler

`src/app/assets/colors.json/route.ts` exports `dynamic = 'force-static'` and a `GET` that returns `Response.json({ colors: allColors })`. Next pre-renders it at build time, so the file is still static, with no runtime work. The `public/assets/colors.json` copy is deleted, because Next refuses to build when a public file and a route share a path.

The `Color` objects already have alpha's field names, which match the old file's keys. The output follows flat-list order with `index` 1–159.

*Alternative:* a prebuild script that writes `public/assets/colors.json`. That was rejected because it adds a build step and a generated file that could drift or get committed by mistake.

### 5. Verification scripts

`verify-colors` changes its `ALLOWED` map, which today is keyed by beta slug:
- It keeps `dull-violet-black: ['cmyk', 'cmyk_array']`.
- It adds `slug` for the seven colors in the legacy map.
- The combination check compares slugs through the legacy map, so the only difference allowed is the expected one.

`verify-routes`:
- drops the percent-encoding step for punctuated slugs, because none are left;
- adds the redirect checks from Decision 3;
- fetches `/assets/colors.json` and checks it has 159 entries that deep-equal `allColors`.

## Risks / Trade-offs

- **Old beta URLs change.** People who visited beta's punctuated URLs will be redirected. Nobody is linking to beta yet, so this only matters for alpha links after the cutover, and the redirects cover those.
- **Escaped redirect sources may not match both the literal and encoded forms.** verify-routes tests both, and Decision 3 names the middleware fallback.
- **The public JSON's content changes.** It gains two colors, every color after index 71 gets a new `index`, and 13 colors get different combination lists. The new values match what the pages show, so this is a correction. Anyone who hard-coded indexes from the old file would see different numbers, but only on beta, and alpha's file is unchanged.
- **The JSON formatting changes** from the old hand-indented file to compact JSON. Clients that parse it don't care.

## Migration Plan

This ships with beta's normal Vercel deploy and doesn't touch Netlify or alpha. To roll back, revert the commit. Nothing persists beyond the build.
