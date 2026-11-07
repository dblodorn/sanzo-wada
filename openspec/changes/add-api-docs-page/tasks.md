# Tasks

## 1. Shared sources

- [x] 1.1 Move `siteOrigin()` from `src/app/layout.tsx` to `src/lib/origin.ts` and import it in the layout. Verify with `typecheck`, and confirm a built page's `og:image` is unchanged.
- [x] 1.2 Save a `tools/list` and `resources/templates/list` response from the current local build for comparison. Verify the file holds 5 tools and 2 templates.
- [x] 1.3 Extract the tool definitions (name, title, description, inputSchema) and resource templates (name, uriTemplate, title, description) into `src/mcp/tools.ts`, and register them from `server.ts`. Verify that `tools/list` and `resources/templates/list` are byte-identical to 1.2 and that `verify:api` passes.
- [x] 1.4 Export from `src/api/openapi.ts` a helper that returns the resource schemas (`components.schemas`) and is reused by `openApiDocument`. Verify the OpenAPI JSON is unchanged.

## 2. Docs page

- [x] 2.1 Add `src/app/api/page.tsx`, a server component that builds the page model: endpoints, resource field tables, tools with JSON Schema inputs, resource templates and the absolute MCP URL. Verify that `next build` lists `/api` as static (○) and that the `/api/v1/*` and `/api/mcp` routes are unchanged.
- [x] 2.2 Add `src/views/Api.tsx` (`'use client'`) with the header (`SwatchHeader` + `Title`) and these sections:
  - overview, linking to the OpenAPI document, `/llms.txt` and `/assets/colors.json`;
  - REST conventions: envelope, errors, CORS, caching;
  - endpoints, each with an `id` of its operationId, a parameter table, error statuses and an example link;
  - resources, as field tables;
  - MCP: URL, transport, tools with `id="tool-<name>"` and input tables, resource templates, and the JSON and `claude mcp add` snippets.
  
  Verify visually in the browser at 1240px and 375px, with no page-level horizontal scroll.
- [x] 2.3 Export the view from `src/views/index.ts` and run Prettier on the new files. Verify with `typecheck`.

## 3. Links to the page

- [x] 3.1 Add `externalDocs` with the absolute `/api` URL to the OpenAPI document. Verify that the document still passes the validator in `verify:api`.
- [x] 3.2 Add a documentation link to `/llms.txt`. Verify it in the served text.

## 4. Verification scripts

- [x] 4.1 `verify:routes`: add `/api` (200, HTML, site title) and update the summary line. Verify it passes locally on port 3000.
- [x] 4.2 `verify:api`: add `checkDocsPage`. It compares the page with the OpenAPI paths and parameters and with `tools/list` names, descriptions and inputs, fetches every example link, and checks the MCP snippet URL, `externalDocs` and the `/llms.txt` link. Verify it passes. Then remove one endpoint from the page temporarily, confirm the check fails, and revert.

## 5. Docs and wrap-up

- [x] 5.1 Update `CLAUDE.md` with the `/api` page, `src/mcp/tools.ts`, `src/lib/origin.ts`, and the new verify coverage. Verify by reading it back.
- [x] 5.2 Full local pass: `typecheck`, `verify:colors`, `verify:routes` and `verify:api` against `next start` on port 3000. All must pass.
- [ ] 5.3 After deploy, run `verify:routes` and `verify:api` against `https://sanzo-wada.dmbk.io`. Verify that both pass and that the page's snippet shows the production MCP URL.
