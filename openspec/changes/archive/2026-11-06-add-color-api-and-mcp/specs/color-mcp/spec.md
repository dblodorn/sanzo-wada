# Spec Delta

## Purpose

A remote Model Context Protocol server that lets AI agents search and read the Sanzo Wada color dictionary as tools and resources, with the same data and results as the REST API.

## ADDED Requirements

### Requirement: Remote MCP server endpoint

The app SHALL serve an MCP server at `/api/mcp` over the Streamable HTTP transport. It SHALL need no authentication, keep no state between requests, and identify itself as `sanzo-wada`, with a short description of the dataset in its instructions. It SHALL offer tools and resources and SHALL NOT change any data.

#### Scenario: Client connects

- **WHEN** an MCP client sends `initialize` to `https://sanzo-wada.dmbk.io/api/mcp`
- **THEN** the server responds with its name `sanzo-wada`, its instructions, and the tools and resources capabilities

#### Scenario: No session needed

- **WHEN** a client calls a tool in a request that carries no session from an earlier request
- **THEN** the call succeeds

### Requirement: Read-only tools

The server SHALL provide these tools. Each SHALL have a description written for a model, a JSON Schema for its input and for its output, and annotations marking it read-only, idempotent and closed-world:
- `search_colors`: optional `query` (name text), optional `group` (`a`–`f`) and optional `limit`. Returns matching colors.
- `get_color`: `slug`. Returns the color and the combinations it appears in.
- `get_combination`: `number` (1–348). Returns the combination and its colors.
- `find_combinations`: `colors` (one to four slugs) and optional `size` (2–4). Returns the combinations that contain all of the given colors.
- `nearest_colors`: `hex` and optional `limit` (1–20, default 5). Returns the nearest colors with their distance.

#### Scenario: Tools are listed

- **WHEN** a client lists tools
- **THEN** exactly these five tools are returned, each with an input schema, an output schema and the read-only annotation

#### Scenario: Find combinations

- **WHEN** `find_combinations` is called with `colors: ["hermosa-pink"]`
- **THEN** combinations 176, 227 and 273 are returned

### Requirement: Tool results match the REST API

A tool's structured result SHALL contain the same resources, in the same shape and order, as the matching REST request returns in `data`:
- `search_colors` matches `/api/v1/colors`
- `get_color` matches `/api/v1/colors/{slug}`
- `get_combination` matches `/api/v1/combinations/{n}`
- `find_combinations` matches `/api/v1/combinations?colors=…`
- `nearest_colors` matches `/api/v1/nearest`

Each result SHALL also include a short text summary that names the colors with their hex values and gives the page URLs, so a model can answer and cite without parsing the structure.

#### Scenario: Same answer through both interfaces

- **WHEN** `nearest_colors` is called with `hex: "#3a5f8c"` and `/api/v1/nearest?hex=3a5f8c` is requested
- **THEN** both return the same colors in the same order with the same distances

#### Scenario: Result can be cited

- **WHEN** `get_combination` is called with `number: 1`
- **THEN** the text summary contains English Red, Cerulian Blue, their hex values and the URL of `/combination/1`

### Requirement: Helpful tool errors

Invalid input SHALL return a tool error result (not a protocol failure) whose message says what was wrong and what is accepted. When `get_color` or `find_combinations` is given an unknown slug, the message SHALL suggest up to three existing slugs whose names are closest to it.

#### Scenario: Unknown slug with suggestions

- **WHEN** `get_color` is called with `slug: "hermosa"`
- **THEN** a tool error is returned that suggests `hermosa-pink`

#### Scenario: Out-of-range number

- **WHEN** `get_combination` is called with `number: 400`
- **THEN** a tool error is returned that says the number must be from 1 to 348

### Requirement: Colors and combinations as resources

The server SHALL expose each color as the resource `sanzo://colors/{slug}` and each combination as `sanzo://combinations/{n}`, with resource templates for both patterns. Listing resources SHALL return all 159 colors and 348 combinations, each with a readable name. Reading a resource SHALL return JSON equal to the matching REST resource.

#### Scenario: Read a color resource

- **WHEN** a client reads `sanzo://colors/hermosa-pink`
- **THEN** the JSON content equals the `data` of `/api/v1/colors/hermosa-pink`

#### Scenario: Unknown resource

- **WHEN** a client reads `sanzo://colors/not-a-color`
- **THEN** the server returns a resource-not-found error
