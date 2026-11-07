# Design

## Context

- Beta, the Next.js 16 App Router app, is production at sanzo-wada.dmbk.io on Vercel.
  - Every page is pre-rendered.
  - The only data route is `src/app/assets/colors.json/route.ts`, a `force-static` handler that serializes `allColors`.
- The color library (`src/colors/`) is pure and synchronous, and holds all 159 colors in memory:
  - lookups: `getColorBySlug`, `getCombination`, `COMBINATION_COUNT`;
  - lists: `swatchGroups`, `allColors`;
  - `legacySlugs`, the seven alpha slugs that redirect.
- chroma-js 3 is already a dependency.
- There are no runtime data sources, no secrets and no database. Everything the API and the MCP server need is the library.
- The checks are `typecheck`, `verify:colors` and `verify:routes`, all run against a running build or a URL. There is no test runner.
- Requirements are in `specs/color-api`, `specs/color-mcp` and `specs/color-library`. Motivation is in proposal.md.

## Goals / Non-Goals

**Goals:**
- Answer each question in one place. The REST handlers and the MCP tools both call the same library queries and the same resource serializers, so "same answer through both interfaces" holds by construction rather than by testing.
- Describe each resource's shape once. A single schema definition gives the TypeScript types, the OpenAPI components and the MCP input and output schemas.
- Keep request handling cheap and stateless, so it runs on the default Vercel Node runtime with no extra infrastructure.

**Non-Goals:**
- Authentication, API keys, per-client rate limiting or usage analytics. Vercel's platform limits and the CDN cache are enough for read-only public data.
- SSE streaming, server-initiated MCP messages, or resumable sessions.
- MCP prompts, sampling or elicitation.
- Generating palettes or anything else beyond what the book contains.
- An npm-published SDK or a local stdio MCP binary. The remote URL is the only distribution.

## Decisions

### 1. Layout: library queries, then serializers, then two thin adapters

```
src/colors/          + queries.ts: searchColors, combinationsWith, nearestColors, groupOf, normalizeHex
src/api/             schemas.ts   zod schemas (resources, params, errors)
                     resources.ts toColorResource / toCombinationResource (adds group, url, api_url)
                     http.ts      ok(), list(), error(); cache and error helpers
                     openapi.ts   assembles the OpenAPI document from schemas.ts
src/mcp/server.ts    builds the McpServer: tools and resources call src/colors and src/api/resources
src/app/api/v1/...   route handlers (REST)
src/app/api/mcp/route.ts   MCP transport
src/app/llms.txt/route.ts
```

The queries go in the library because the spec puts them there and because they are useful outside HTTP (verify scripts, future pages). The serializers take an `origin` argument, so absolute URLs are built from the incoming request.

*Alternative considered:* have the MCP tools call the REST endpoints over HTTP. That adds latency and self-fetch failure modes, and needs an absolute URL at build time, for no benefit.

### 2. REST routes are dynamic handlers cached by the CDN, not pre-rendered

Every `/api/v1/*` handler reads `request.url` (for the query string and for the origin in links), so each runs per request. The responses still cost almost nothing:
- Successful responses send `Cache-Control: public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400`.
- Vercel's CDN caches per URL, including the query string, and each deployment starts with a fresh cache. So data can never be stale across deploys, and after the first request a function runs again only for a new query.
- Errors send `public, max-age=60`, which caches them briefly.

*Alternatives considered:*
- `generateStaticParams` plus `force-static` for `colors/[slug]` and `combinations/[n]` would pre-render 507 more files. But static handlers can't read the query string or the request origin.
- Accepting legacy slugs on `colors/[slug]` would need `dynamicParams` anyway.
- One uniform model is simpler, and the CDN gives the same result after the first hit.

### 3. Absolute URLs come from the request origin

`url` and `api_url` are built from `new URL(request.url).origin`, so a local run, a preview deploy and production each link to themselves, and the "links resolve" scenario passes everywhere. The CDN cache key includes the host, so a cached response never leaks another host's links.

*Alternative considered:* a hard-coded `https://sanzo-wada.dmbk.io`. It's simpler, but previews and `verify:*` against localhost would point at production.

### 4. Routing: specific handlers, a catch-all 404, and CORS in `next.config.ts`

- Handlers live at `api/v1/colors/route.ts`, `api/v1/colors/[slug]/route.ts`, `api/v1/combinations/route.ts`, `api/v1/combinations/[n]/route.ts`, `api/v1/groups/route.ts`, `api/v1/nearest/route.ts` and `api/v1/openapi.json/route.ts`.
- `api/v1/[...rest]/route.ts` returns the JSON 404 for unknown paths. Next matches specific segments before a catch-all.
- Each handler exports `GET`. `POST`, `PUT`, `PATCH` and `DELETE` are exported from a shared helper that returns the JSON 405. Otherwise Next would answer 405 with an empty body. `HEAD` is derived by Next from `GET`.
- CORS headers (`Access-Control-Allow-Origin: *`, `Allow-Methods: GET, HEAD, OPTIONS`, `Allow-Headers: Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version`, `Expose-Headers: Mcp-Session-Id`) go in `next.config.ts` `headers()` for `/api/:path*`. They then apply to every response, including errors, 405s and Next's own `OPTIONS` reply, without each handler remembering them. `OPTIONS` is exported explicitly, returning 204, so preflight never depends on the default behaviour.
- `colors/[slug]` decodes the param and maps it through `legacySlugs` before lookup, so `hay's-russet` returns the normalized color with a 200, not a redirect, which simplifies clients.

### 5. One schema source: zod 4

- Add `zod` (4.x). `schemas.ts` defines the color, combination, group, nearest-result, list-envelope and error schemas, plus the query parameter schemas.
- From those definitions:
  - **Types:** `z.infer` gives the TypeScript types the serializers return. A mismatch is a type error.
  - **Parameters:** handlers parse query parameters with `safeParse`. A failure becomes `invalid_parameter`, with the issue path as the parameter name.
  - **OpenAPI:** `z.toJSONSchema(schema, { target: 'openapi-3.1' })` produces the OpenAPI component schemas. The `paths` object is written by hand in `openapi.ts`: seven endpoints, with descriptions written for models. It references the components, so the document cannot drift from the shapes.
  - **MCP:** the same zod objects are the tools' `inputSchema` and `outputSchema`, which is what the MCP SDK expects.

*Alternatives considered:*
- A hand-written OpenAPI file can drift from the code.
- `zod-openapi` or `@asteasolutions/zod-to-openapi` are extra dependencies for what zod 4 now does natively.
- TypeBox is fine, but the MCP SDK is built around zod.

### 6. MCP: the official TypeScript server SDK's `createMcpHandler`, stateless, JSON responses

- Use `@modelcontextprotocol/server` (v2, pinned to 2.4.0). Its `createMcpHandler(factory, options)` returns a web-standard `fetch` handler, which is exactly what a Next route handler needs.
- It serves both protocol generations from one factory:
  - the 2026-07-28 revision, where each request carries its own envelope;
  - 2025-era clients, through its built-in stateless fallback, a fresh instance over the streamable HTTP transport with `sessionIdGenerator: undefined`.
- The factory builds a fresh `McpServer` per request, reading the request origin from the factory context for links.
- Options: `responseMode: 'json'`, so replies to the 2026-07-28 revision are plain JSON rather than SSE. The 2025-era fallback still answers each POST with a single SSE frame. Both are valid Streamable HTTP, and clients accept either.
- `src/app/api/mcp/route.ts` creates the handler once at module level and exports `GET`, `POST` and `DELETE`, which all delegate to `handler.fetch`. In the stateless fallback, `GET` and `DELETE` are answered with 405.
- The route sets `export const dynamic = 'force-dynamic'` and sends `Cache-Control: no-store`.

Building a server per request is the SDK's documented stateless pattern, and with in-memory data it costs microseconds.

The SDK leaves Host and Origin validation to the caller, as protection against DNS rebinding of local servers. This server is public, read-only and allows any origin, so no validation is added.

The pieces:
- **Tool annotations:** `{ readOnlyHint: true, idempotentHint: true, openWorldHint: false }`.
- **Tool results:** `structuredContent` is the same resource objects REST returns. `content` is a single text block built by a `summarize*` helper, for example `"Combination 1: English Red #de4500, Cerulian Blue #29bdad — https://…/combination/1"`.
- **Tool errors:** returned as `{ isError: true, content: [...] }`.
- **Unknown-slug suggestions:** rank all slugs by Levenshtein distance on the normalized name, with a prefix match as a tiebreak, and take the top three. A small local function does this, with no dependency.
- **Resources:** two `ResourceTemplate`s, with `list` callbacks that return all colors and all combinations and `read` callbacks that return the REST resource JSON. An unknown URI throws the SDK's resource-not-found error.

*Alternatives considered:*
- Wiring `WebStandardStreamableHTTPServerTransport` by hand (this design's first draft) serves only 2025-era clients. `createMcpHandler` adds the 2026-07-28 revision with the same factory.
- `mcp-handler` (Vercel's adapter) wraps the same SDK. It adds a Redis-backed SSE mode we don't want, plus CLI dependencies, and pins the SDK version for us.
- SDK v1 (`@modelcontextprotocol/sdk` 1.32) works too, but v2 is the maintained line and ships the web-standard transport as a first-class export.
- A hand-rolled JSON-RPC handler is too much protocol surface to get right.

### 7. Nearest colors: chroma's CIEDE2000 with a precomputed Lab table

- `chroma.deltaE(a, b)` in chroma-js 3 is CIEDE2000.
- Precompute each color's Lab value once at module load. Per request, convert the query hex once and compute 159 distances, which is far under a millisecond.
- `normalizeHex` accepts `#?[0-9a-f]{3}` or `#?[0-9a-f]{6}`, ignoring case, expands 3-digit values, and returns `#rrggbb` or `null`.
- Distances are rounded with `Math.round(d * 100) / 100`.
- A stable sort on `(distance, index)` gives the specified tie-break.

*Alternative considered:* RGB Euclidean distance is cheaper, but its rankings are perceptually poor, and the spec fixes CIEDE2000.

### 8. `/llms.txt` is a route handler built from the same endpoint list

`src/app/llms.txt/route.ts` renders Markdown text from a small endpoint table shared with `openapi.ts` (path, summary, example query), using the request origin. It returns `text/plain; charset=utf-8` and uses the same CDN caching as the API. Keeping the table in one place means a new endpoint is added to both documents at once.

### 9. Verification: a new `verify:api` script

`scripts/verify-api.ts <origin>` is a separate script, like `verify:routes`, and is run against a running build or production. It checks:
- **Endpoints:** every endpoint and every spec scenario's request, success and error alike, for status, content type, CORS and `Cache-Control`.
- **Shapes:** every response body is parsed with the zod schema for that endpoint and status.
- **Public JSON:** `/api/v1/colors` matches `/assets/colors.json` entry by entry.
- **Links:** all 159 color `url`s and `api_url`s, and a sample of combination ones, resolve.
- **OpenAPI:** the document validates with `@readme/openapi-parser`, a dev-only dependency.
- **MCP:** a session over raw `fetch` JSON-RPC sends `initialize`, `tools/list`, each tool's scenarios, `resources/list` and `resources/read`, and checks that each tool's `structuredContent` deep-equals the matching REST `data`.

Raw `fetch` keeps the script free of an MCP client dependency, and it doubles as a check that the server works for a minimal client. `verify:routes` still covers the pages and `/assets/colors.json` unchanged.

## Risks / Trade-offs

- **[Risk] MCP SDK v2 is recent, and its export names may move between minors.** → Pin an exact version (2.4.0), keep all SDK usage in `src/mcp/server.ts` and the one route file, and let `verify:api`'s MCP session catch regressions on upgrade.
- **[Risk] The site is no longer fully static.** Functions add cold starts, and an error in one could take down `/api` or `/api/mcp`. → Pages and `/assets/colors.json` stay pre-rendered and don't depend on the functions. Most responses after the first come from the CDN.
- **[Risk] Public, unauthenticated function endpoints can be scraped or hammered.** → The data is public and cheap to compute, the CDN absorbs repeated URLs, and Vercel's firewall can add a rate limit later without changing the API.
- **[Trade-off] Links follow the request origin,** so a response copied from a preview contains preview URLs. This is acceptable, because the URLs are correct for the host that served them.
- **[Trade-off] MCP returns full REST resources, which some agents may find too large.** For example, `get_color` includes every combination's colors. → The text summary gives a compact view, and `limit` bounds the list tools. A slimmer projection can be added later as a tool option without breaking the contract.
- **[Risk] zod's OpenAPI output may not be accepted by every OpenAPI tool,** for example nullable or union quirks. → `verify:api` validates the generated document on every run, and the schemas avoid exotic constructs.

## Migration Plan

1. The changes are purely additive: new routes, new library functions and one `next.config.ts` `headers()` entry. Pages and `/assets/colors.json` are untouched.
2. Build and run `verify:routes`, `verify:colors` and `verify:api` against a local `next start`.
3. Merge to `master`, so Vercel deploys production. Then run `verify:api https://sanzo-wada.dmbk.io`, and connect a real MCP client (for example `claude mcp add --transport http sanzo-wada https://sanzo-wada.dmbk.io/api/mcp`) as a final check.
4. Rollback is a Vercel instant rollback to the previous deployment, or a revert. Nothing outside the repo depends on the API yet.

## Open Questions

- Whether to link the API from the site: for example, point the landing page's "JSON API" menu link at the docs, or add an API section to `/about`. This is deferred because the spec currently fixes the landing link to `/assets/colors.json`. It would be a separate, small change to `color-dictionary-app`.
- Whether to submit the server to MCP registries once it's live. This doesn't affect the code.
