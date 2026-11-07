# Proposal

## Why

The only machine-readable access to the dictionary is `/assets/colors.json`: one static dump of all 159 colors, with no combinations, no lookups and no description of its shape. A developer or an AI agent who wants "combination 42", "every combination with Hays Russet", or "the Sanzo color closest to #3a5f8c" has to download everything and reimplement the library's logic. Now that beta serves production at sanzo-wada.dmbk.io, the color library can be published as a proper read-only API, documented so agents can discover it, plus an MCP server so agents can call it as tools without writing an HTTP client.

## What Changes

- Add a versioned, read-only REST API under `/api/v1/`, built with Next.js route handlers in the beta app:
  - `GET /api/v1/colors`: all colors, with optional filtering by name text and by swatch group
  - `GET /api/v1/colors/{slug}`: one color, including the combinations it appears in
  - `GET /api/v1/combinations` and `GET /api/v1/combinations/{n}`: combinations with their colors
  - `GET /api/v1/groups`: the six swatch groups
  - `GET /api/v1/nearest?hex=…`: the Sanzo colors closest to any hex color, ranked by perceptual distance
- Give every endpoint consistent JSON responses: the same color shape as `/assets/colors.json`, `{ "error": { "code", "message" } }` for errors with real 400/404 statuses, CORS open to any origin, and cache headers suited to data that only changes on deploy.
- Help agents discover and understand the API:
  - an OpenAPI 3.1 document at `/api/v1/openapi.json`, generated from the same types as the API
  - an `/llms.txt` that summarizes the dataset, the endpoints and the MCP server in plain text
  - links between resources (a color links to its combinations, and a combination to its colors), each with its page URL and API URL
- Add a remote MCP server at `/api/mcp` (Streamable HTTP, stateless, no authentication), with read-only tools:
  - `search_colors`, `get_color`, `get_combination`, `find_combinations` (combinations containing every color given), `nearest_colors`
  - each color and combination also exposed as an MCP resource
  - tool results return structured content and include links to the website, so an agent can cite the page
- Add query functions to the color library (name search, combinations containing a set of colors, nearest color by perceptual distance), so the REST API and the MCP server share one implementation and return the same results.
- `/assets/colors.json` keeps its exact current shape and URL, because the landing page links to it and people use it. It is not changed.
- Alpha is not changed.

## Capabilities

### New Capabilities

- `color-api`: the versioned REST API under `/api/v1/`, covering endpoints, response and error shapes, CORS and caching, the OpenAPI document and `/llms.txt`.
- `color-mcp`: the MCP server at `/api/mcp`, covering transport, tools, resources and result shapes, and its consistency with the REST API.

### Modified Capabilities

- `color-library`: adds name search, combinations containing a given set of colors, and nearest colors to a hex value by perceptual distance.

## Impact

- **Code:** new route handlers under `apps/sanzo-wada-beta/src/app/api/` and `src/app/llms.txt/`, new query functions in `src/colors/`, and a shared response layer used by both REST and MCP.
- **Dependencies:** an MCP server SDK for the Streamable HTTP transport (chosen in design), and possibly a schema library to generate OpenAPI from the types and validate tool inputs.
- **Rendering and hosting:** most REST responses can be generated at build time like the pages. `nearest`, filtered lists and MCP run per request as Vercel functions, so the app is no longer purely static. They read the in-memory library, so there's no database and no secrets.
- **Verification:** `verify:routes` grows, or a new `verify:api` script is added, to check every endpoint, the error cases, OpenAPI validity and an MCP session (initialize, list tools, call each tool) against a running build or production.
- **Public surface:** `/api/v1` becomes a public contract. Later breaking changes go to `/api/v2`.
- **Unchanged:** `/assets/colors.json`, every page URL and its rendering, and alpha.
