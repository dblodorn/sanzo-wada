# Tasks

## 1. Setup

- [x] 1.1 On a new branch, add `zod` (4.x) and `@modelcontextprotocol/server` (exact 2.4.x version) to beta's dependencies and `@readme/openapi-parser` to its devDependencies with pnpm. Verify that `pnpm install` succeeds, `pnpm --filter sanzo-wada-beta typecheck` passes, and the SDK exports `McpServer`, `ResourceTemplate`, `ResourceNotFoundError` and `createMcpHandler` (import them in a scratch file under `tsc`).
- [x] 1.2 Add a `verify:api` script entry to beta's `package.json` pointing at `scripts/verify-api.ts` (a stub that exits 0 for now). Verify that `pnpm --filter sanzo-wada-beta verify:api http://localhost:3000` runs.

## 2. Color library queries

- [x] 2.1 Add `groupOf(slug)` and a groups listing (id, count, slugs) to `src/colors/`. Verify with a scratch `tsx` run that the first color of the second file is in group `b` and the counts are 38, 49, 23, 23, 20 and 6.
- [x] 2.2 Add `searchColors(text, group?)` with the spec's normalization (case-insensitive; apostrophes removed; other punctuation and space runs become one space). Verify that `RED` returns 19 colors starting with Coral Red, `hays russet` returns Hay's Russet, and an unmatched text returns `[]`.
- [x] 2.3 Add `combinationsWith(slugs, size?)`, returning results in ascending number or the first unknown slug. Verify that `['hermosa-pink']` gives 176, 227 and 273, a size filter returns only that size, and an unknown slug is reported.
- [x] 2.4 Add `normalizeHex` and `nearestColors(hex, limit = 5)`, using chroma `deltaE` over a precomputed Lab table with a `(distance, index)` sort and distances rounded to two decimals. Verify that `#ffb3f0` gives Hermosa Pink at 0 first, `FFF`, `#fff` and `#FFFFFF` give identical results, and `#12345` and `blue` are rejected.
- [x] 2.5 Export the new functions and types from `src/colors/index.ts` with no `any` at the boundary. Verify that `typecheck` passes and `verify:colors` still passes.

## 3. API resource layer

- [x] 3.1 Write `src/api/schemas.ts` with the zod schemas for the color, color detail (with `combination_details`), combination, group, nearest result, list envelope, single envelope and error resources, and for each endpoint's query parameters. Verify that `typecheck` passes and the inferred types line up with the library's `Color`.
- [x] 3.2 Write `src/api/resources.ts` (`toColorResource`, `toColorDetail`, `toCombinationResource`, `toGroupResource`, all taking `origin`) and `src/api/http.ts` (`ok`, `list`, `apiError` with the code-to-status mapping, the cache headers from design decision 2, and a shared 405 handler set). Verify with a scratch `tsx` run that each serializer's output parses with its schema.
- [x] 3.3 Add the CORS `headers()` entry for `/api/:path*` to `next.config.ts`, keeping the existing redirects. Verify that `typecheck` passes and the build still lists the legacy redirects.

## 4. REST endpoints

- [x] 4.1 Add `api/v1/colors/route.ts` (filters `q` and `group`) and `api/v1/colors/[slug]/route.ts` (legacy slug mapping, `combination_details`, 404). Verify with `curl` against `next dev`, using the spec scenarios: `?q=hays%20russet`, `?group=f`, `?group=z` returning 400, `hermosa-pink`, `hay's-russet` and `not-a-color` returning 404.
- [x] 4.2 Add `api/v1/combinations/route.ts` (filters `colors` and `size`) and `api/v1/combinations/[n]/route.ts`. Verify with `curl`: count 348 with the size split 120/120/108, `?colors=hermosa-pink`, `/1`, `/349` returning 404, and an unknown slug in `colors` returning 400.
- [x] 4.3 Add `api/v1/groups/route.ts` and `api/v1/nearest/route.ts`. Verify with `curl`: six groups, `?hex=ffb3f0&limit=3`, and a missing `hex` returning 400.
- [x] 4.4 Add `api/v1/[...rest]/route.ts` (JSON 404), the explicit `OPTIONS` 204, and the JSON 405 for write methods on every handler. Verify with `curl` that `/api/v1/palettes` returns 404, `POST /api/v1/colors` returns 405 JSON, and `OPTIONS` returns 204 with the CORS headers.

## 5. Agent documentation

- [x] 5.1 Write `src/api/openapi.ts` and `api/v1/openapi.json/route.ts`: the shared endpoint table, hand-written `paths` with model-oriented descriptions and parameters, and components from `z.toJSONSchema(..., { target: 'openapi-3.1' })`. Verify that `@readme/openapi-parser` validates the served document in a scratch run.
- [x] 5.2 Add `src/app/llms.txt/route.ts`, rendered from the same endpoint table with the request origin: the dataset summary, endpoints with absolute example URLs, the MCP URL, the OpenAPI link and the page URL patterns. Verify with `curl` that it returns `text/plain` and contains the absolute `/api/v1/openapi.json` and `/api/mcp` URLs.

## 6. MCP server

- [x] 6.1 Write `src/mcp/server.ts`, which creates a `McpServer` named `sanzo-wada` with instructions and five tools (`search_colors`, `get_color`, `get_combination`, `find_combinations`, `nearest_colors`). Each tool has zod input and output schemas, read-only, idempotent and closed-world annotations, `structuredContent` built from `src/api/resources.ts`, and a text summary. Verify that `typecheck` passes.
- [x] 6.2 Add tool error handling: tool errors with the accepted values, and up to three slug suggestions from a local Levenshtein ranking. Verify in a scratch run that `hermosa` suggests `hermosa-pink` and number 400 explains the 1–348 range.
- [x] 6.3 Register the `sanzo://colors/{slug}` and `sanzo://combinations/{n}` resource templates, with `list` (all 159 and all 348) and `read` (REST resource JSON, not-found error for unknown URIs). Verify that `typecheck` passes.
- [x] 6.4 Add `src/app/api/mcp/route.ts`: `createMcpHandler` with a per-request server factory and `responseMode: 'json'`, `force-dynamic` and `Cache-Control: no-store`. Verify with `curl` JSON-RPC against `next dev` that `initialize` returns `sanzo-wada` and `tools/list` returns the five tools.

## 7. Verification

- [x] 7.1 Implement `scripts/verify-api.ts <origin>` to check:
  - every color-api scenario: status, content type, CORS, `Cache-Control`, and each body parsed with its zod schema;
  - `/api/v1/colors` equal to `/assets/colors.json` plus `group`, `url` and `api_url`;
  - all color links and sampled combination links resolving;
  - OpenAPI validity;
  - `/llms.txt`;
  - a raw-fetch MCP session (`initialize`, `tools/list`, each color-mcp scenario, `resources/list` and `resources/read`), with each tool's `structuredContent` deep-equal to the matching REST `data`.

  Verify that it passes against a local `next build` plus `next start`.
- [x] 7.2 Confirm that nothing else changed. Against the same local build, verify that `verify:routes` passes (pages, legacy redirects, `/assets/colors.json` unchanged), `verify:colors` passes, `typecheck` passes, and `pnpm build:beta` lists the new `/api` routes as dynamic, with every page still static.
- [x] 7.3 Connect a real MCP client to the local server (for example `claude mcp add --transport http sanzo-wada-local http://localhost:3000/api/mcp`), then call `nearest_colors` and `get_combination`. Verify that the results and summaries come back as specified, then remove the client entry.

## 8. Documentation and release

- [x] 8.1 Update `CLAUDE.md`'s beta architecture section with the `src/api` and `src/mcp` layout, the REST and MCP routes, the caching model, `verify:api` in the commands list, and the rule that REST and MCP share serializers. Verify by review in the PR diff.
- [x] 8.2 Commit, open a PR, and after merge run `verify:api https://sanzo-wada.dmbk.io` against production. Verify that it passes and the Vercel production deploy succeeded.
