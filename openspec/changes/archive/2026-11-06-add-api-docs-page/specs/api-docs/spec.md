# Spec Delta

## Purpose

A human-readable documentation page at `/api` that explains the color dictionary's REST API and MCP server, so a developer can understand and try both without reading the OpenAPI document or `/llms.txt`.

## ADDED Requirements

### Requirement: Documentation page at /api

The app SHALL serve an HTML page at `/api`, generated at build time as static HTML like every other page, with its content and styles already in the HTML. Requesting `/api` SHALL NOT change how any `/api/v1/*` or `/api/mcp` request is answered.

#### Scenario: Page is served

- **WHEN** `/api` is requested
- **THEN** it returns HTTP 200 with `text/html` content that contains the page's headings

#### Scenario: API routes unaffected

- **WHEN** `/api/v1/colors` and `/api/mcp` are requested after the page is added
- **THEN** they respond exactly as before

### Requirement: REST API documentation

The page SHALL document the REST API:
- the base path `/api/v1`, that it is read-only, needs no authentication and allows any origin
- the response envelope (`{ "data": ... }` and `{ "data": [...], "count": n }`) and the error shape with its codes and statuses
- every endpoint the OpenAPI document describes, each with its method and path, summary, description, parameters (name, where it goes, whether it's required, description), possible error statuses, and a link to a working example request
- the fields of each resource (color, color detail, combination, group, nearest result), including `url`, `api_url` and `card_url`

The endpoint list SHALL be the same as the OpenAPI document's, in the same order, with the same summaries and parameters.

#### Scenario: Every endpoint is documented

- **WHEN** the page is compared with `/api/v1/openapi.json`
- **THEN** every path in the OpenAPI document appears on the page with each of its parameters, and the page lists no path the document lacks

#### Scenario: Examples work

- **WHEN** each example link on the page is followed
- **THEN** it returns HTTP 200 with a JSON response

### Requirement: MCP server documentation

The page SHALL document the MCP server:
- its absolute URL (`<site origin>/api/mcp`), that it uses Streamable HTTP and needs no authentication
- each tool, with its name, title, description and input parameters (name, type, whether it's required, description)
- each resource template, with its URI pattern and description
- how to connect, with at least one copyable client configuration that uses the server's absolute URL

The tool list SHALL be the same as the tools the server offers, in the same order, with the same names and descriptions.

#### Scenario: Every tool is documented

- **WHEN** the page is compared with the server's `tools/list` result
- **THEN** every tool appears on the page with its description and each of its input properties, and the page lists no tool the server lacks

#### Scenario: Connection snippet uses the deployed origin

- **WHEN** the page is requested from the production site
- **THEN** its connection snippet contains `https://sanzo-wada.dmbk.io/api/mcp`

### Requirement: Links to the machine-readable docs

The page SHALL link to `/api/v1/openapi.json`, `/llms.txt` and `/assets/colors.json`, and to the site's index.

#### Scenario: Links present

- **WHEN** the page's links are collected
- **THEN** they include `/api/v1/openapi.json`, `/llms.txt`, `/assets/colors.json` and `/`, and each returns HTTP 200

### Requirement: Page looks like the rest of the site

The page SHALL use the site's fonts, colors and header pattern (a sticky header with the title linking to `/`), keep the site's document title and description, and SHALL fit a 375px-wide window with no horizontal page scroll; long code samples MAY scroll inside their own block.

#### Scenario: Narrow window

- **WHEN** the page is shown in a 375px-wide window
- **THEN** the page itself does not scroll horizontally
