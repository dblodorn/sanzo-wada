# Design

## Context

See proposal.md for why. Current state in `apps/sanzo-wada-beta`:

- `src/api/endpoints.ts` is the endpoint table. `src/api/openapi.ts` turns it and the zod `apiRegistry` (via `z.toJSONSchema`) into the OpenAPI document, and `src/app/llms.txt/route.ts` renders it as text. Both build absolute URLs from the request origin.
- `src/mcp/server.ts` registers the five tools and two resource templates inline inside `createServer(origin)`, so their names, descriptions and input schemas only exist on a live server instance.
- `src/app/api/` holds only route handlers (`v1/*`, `mcp`). There is no `page.tsx`, so `/api` is the site 404.
- `next.config.ts` sends CORS headers for `/api/:path*`. `:path*` matches zero segments, so `/api` itself will get them too. That is harmless for a public, read-only HTML page.
- `siteOrigin()` lives privately in `src/app/layout.tsx` and decides `metadataBase` (production URL, preview URL, or localhost).
- Pages are server components that pass plain props to `'use client'` views styled with styled-components (`src/views/*`, theme tokens in `src/styles/theme.json`). `About` is the closest model: `SwatchHeader` + `Title`, then a `Section` of copy.

## Goals / Non-Goals

**Goals:**
- One source for each fact on the page: endpoints from `endpoints.ts`, resource fields from the zod schemas, tools and resource templates from the same definitions the MCP server registers.
- A fully static page, consistent with "every page is pre-rendered".
- Checks in the existing verify scripts that fail if the page drifts from OpenAPI or `tools/list`.

**Non-Goals:**
- An interactive console ("try it" forms, Swagger UI or similar). Example links are enough and add no dependency.
- Changing the landing menu's "JSON API" button or any other existing page.
- Versioned or multi-page docs.

## Decisions

**1. `src/app/api/page.tsx` beside the route handlers.** The App Router allows a `page.tsx` in a folder whose children are route handlers, since `route.ts` and `page.tsx` only conflict in the *same* segment. Alternative: `/docs` or `/developers`. Rejected because the user asked for `/api`, and it's where people look.

**2. Extract MCP tool and resource metadata into `src/mcp/tools.ts`.** Export an ordered list of `{ name, title, description, inputSchema }` and of resource templates `{ name, uriTemplate, title, description }`. `server.ts` spreads these into `registerTool`/`registerResource`, adding its handlers, `outputSchema` and annotations. The page renders the same objects, converting each `inputSchema` with `z.toJSONSchema` to list properties, types, required and descriptions. Alternative: start an in-memory server and call `tools/list` at build time. Rejected as heavier and indirect, with no gain since the data is the same.

**3. Resource fields from the OpenAPI components.** Reuse the `z.toJSONSchema(apiRegistry, …)` output that `openapi.ts` already makes (export a helper that returns `components.schemas`), and render each schema's `properties` and `description`. Then the docs, OpenAPI and responses all come from `schemas.ts`.

**4. Server component prepares data, client view renders it.** `page.tsx` builds a serialisable model (endpoints, schema field tables, tools, resource templates, MCP URL) and passes it to a new `src/views/Api.tsx` (`'use client'`, styled-components, existing tokens and fonts). Small presentational pieces (parameter table, code block) live in the view file unless they're reused.

**5. Origins.** Move `siteOrigin()` to `src/lib/origin.ts` and use it in `layout.tsx` and the page. The MCP URL and client snippet are absolute (`${siteOrigin()}/api/mcp`), since a client config needs one; the production build bakes in `https://sanzo-wada.dmbk.io`. Example request links stay relative, so they work on any host, including previews and localhost.

**6. Client snippet.** Show a generic JSON `mcpServers` entry using the `url` form (`{ "mcpServers": { "sanzo-wada": { "url": "<origin>/api/mcp" } } }`) and the Claude Code command (`claude mcp add --transport http sanzo-wada <origin>/api/mcp`). Both are plain text in `<pre>` blocks with no copy script, which keeps the page static. A copy button is optional polish.

**7. Stable anchors for linking and checking.** Each endpoint section gets `id="<operationId>"` and each tool `id="tool-<name>"`. Parameter and property names are rendered in `<code>`. `verify:api` matches on these instead of on prose.

**8. Links into the page.** `openapi.ts` adds `externalDocs: { description, url: origin + '/api' }` (request origin, like `servers`). `llms.txt` adds a "Documentation" line under the MCP/REST sections.

**9. Verification.**
- `verify:routes`: add `/api` to the 200 list and check that its content type is HTML and its `<title>` is the site title.
- `verify:api`, new `checkDocsPage`:
  - every OpenAPI path's `operationId` has an anchor, and each of its parameter names appears in that section;
  - there are no extra endpoint anchors;
  - every `tools/list` tool has an anchor with its description and input property names, and there are no extra tool anchors;
  - every example `href` returns 200 JSON;
  - the snippet contains `${base}/api/mcp`;
  - OpenAPI `externalDocs.url === base + '/api'`;
  - `/llms.txt` contains `${base}/api`.
  
  Parsing is done with regex over the static HTML, as the scripts already do for meta tags.

## Risks / Trade-offs

- [styled-components class names make HTML matching brittle] → Checks rely only on `id` attributes, `href`s and `<code>` text, not on classes.
- [Origin baked at build differs from the host serving a preview] → Only the MCP snippet is absolute. Previews use `VERCEL_BRANCH_URL`, as `metadataBase` already does. A local build is checked on port 3000, as for share cards.
- [Refactoring tool registration could change MCP output] → `verify:api` already compares every tool result with REST. Also diff a `tools/list` response before and after the refactor and require it to be identical.
- [CORS headers on an HTML page] → Acceptable for a public, read-only page. Narrowing the header source to `/api/:path+` is possible but needless, and it changes `color-api` behaviour for nothing.

## Migration Plan

This is purely additive: a new page and one new OpenAPI field. Deploy by merging to `master`, then run `verify:routes` and `verify:api` against production. Roll back by reverting the merge.
