# Proposal

## Why

The REST API and MCP server are only documented in machine-readable form, at `/api/v1/openapi.json` and `/llms.txt`. A person who wants to use them has no page to read: `/api` returns the site's 404. A human-readable page at `/api` makes both discoverable and easy to try, while the endpoint table that already drives the OpenAPI document and `/llms.txt` keeps all three in step.

## What Changes

- Add a statically rendered page at `/api` that documents:
  - the REST API: base URL, response envelope, errors, CORS and caching, then each endpoint from `src/api/endpoints.ts` with its parameters, possible errors and a working example link;
  - the resource shapes (color, color detail, combination, group, nearest result), including `url`, `api_url` and `card_url`;
  - the MCP server: its URL (`/api/mcp`), transport, its five tools with their inputs, its two resource templates, and how to connect a client (for example a Claude or generic MCP client config snippet);
  - links to `/api/v1/openapi.json`, `/llms.txt` and `/assets/colors.json`.
- Render the endpoint and tool sections from the same sources the OpenAPI document and MCP server use (`endpoints.ts`, the zod schemas and the MCP tool definitions), so the page cannot drift from the API.
- Style the page with the site's existing fonts, theme tokens and header pattern, so it reads as part of the dictionary.
- Point to the page from `/llms.txt` and from the OpenAPI document (`externalDocs`).
- Extend `verify:routes` (the page is served and is static) and `verify:api` (every endpoint and tool is listed on the page, and its example links work).
- Not changed: every existing page, including the landing menu's "JSON API" button, which keeps linking to `/assets/colors.json` as in alpha. Any API response other than the added `externalDocs` link. Alpha.

## Capabilities

### New Capabilities

- `api-docs`: the human-readable documentation page at `/api` for the REST API and MCP server, its content, how it stays in sync with the API, and how it's linked.

### Modified Capabilities

- `color-api`: the OpenAPI document gains an `externalDocs` link to `/api`, and `/llms.txt` lists the docs page.
- `color-dictionary-app`: the list of URLs the app serves gains `/api`.

## Impact

- New route `apps/sanzo-wada-beta/src/app/api/page.tsx`, plus a view and small presentational components for the docs.
- `src/api/endpoints.ts` and `src/mcp/server.ts` may need their tool metadata exported so the page can render it without starting a server.
- `src/api/openapi.ts`, `src/app/llms.txt/route.ts`: add the link to the docs page.
- `scripts/verify-routes.ts`, `scripts/verify-api.ts`: new checks.
- `CLAUDE.md`: document the page.
- `/api` sits beside the `/api/v1/*` and `/api/mcp` route handlers. A `page.tsx` at `src/app/api/` doesn't conflict with them, and `next.config.ts` CORS headers apply to `/api/:path*` only if that pattern matches `/api` itself (to check in design).
- No new dependencies expected. No data, URL or alpha changes.
