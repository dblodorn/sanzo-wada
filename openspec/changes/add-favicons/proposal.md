# Proposal

## Why

The site has no favicon, so every tab shows the browser's blank page icon, and a dozen open swatch tabs can't be told apart. Since the colors are the whole point of the site, each page's icon should show them.

## What Changes

- Each of the 159 swatch pages gets a favicon: a square filled with that color.
- Each of the 348 combination pages gets a favicon: its colors as side-by-side bars of equal width filling a square, in the library's order (the same order as the page and the share card).
- The landing page gets a square favicon in one color picked at random from all 159. A new color is picked on each visit, so the icon changes from one page load to the next. The pre-rendered HTML carries a fixed fallback color, so the page still has an icon before any script runs.
- `/about`, `/api` and the 404 page use the same random-color favicon as the landing page.
- The swatch and combination icons are static files generated at build time from the color library, like the share cards. An unknown slug or number returns 404.
- `verify:routes` checks that every page links its favicon and that every icon URL serves the right colors.

Out of scope: Apple touch icons, a web app manifest, favicons for arbitrary hex values or palettes, and adding icon URLs to the REST API or MCP resources.

## Capabilities

### New Capabilities
- `favicons`: the favicon for each page (swatch, combination, landing and the other pages): the icon URLs, what each icon shows, the random pick on the landing page, static generation and 404s.

### Modified Capabilities
- `color-dictionary-app`: "Document metadata and static assets match alpha" changes. Every page also links a favicon (see `favicons`), and that link does not change the `<title>`, the meta description or anything the page shows.

## Impact

- **New routes:** an icon route for each swatch and combination (`src/app/swatch/[slug]/favicon.svg/route.ts` and `src/app/combination/[n]/favicon.svg/route.ts`), with `generateStaticParams`, `force-static` and `dynamicParams = false`, plus shared icon markup in `src/icons/`.
- **Layout:** `src/app/layout.tsx` renders one small client component that links the right icon for the current path and picks the random color on the landing page and the other non-color pages. No individual page changes.
- **Caching:** icon URLs get the same long, immutable cache headers as the share cards in `next.config.ts`.
- **Checks:** `scripts/verify-routes.ts` gains icon checks.
- **Build:** 507 more static files, which are small SVGs. No new dependencies.
- **Alpha:** unchanged. Alpha has no favicon, so this is a deliberate departure from one-to-one parity, as the share cards were.
