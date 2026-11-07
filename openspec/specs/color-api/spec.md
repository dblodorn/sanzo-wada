# color-api Specification

## Purpose

A versioned, read-only REST API over the Sanzo Wada color dictionary, documented so that developers and AI agents can discover it and use it without scraping pages or downloading the whole dataset.

## Requirements

### Requirement: Versioned read-only endpoints

The app SHALL serve these endpoints under `/api/v1/`, all answering `GET` (and `HEAD`):
- `/api/v1/colors`: the list of colors
- `/api/v1/colors/{slug}`: one color
- `/api/v1/combinations`: the list of combinations
- `/api/v1/combinations/{n}`: one combination
- `/api/v1/groups`: the six swatch groups
- `/api/v1/nearest`: the colors nearest to a hex value
- `/api/v1/openapi.json`: the API description

The API SHALL NOT change any data. Any other path under `/api/v1/` SHALL return a 404 error response.

#### Scenario: Every endpoint answers

- **WHEN** each endpoint above is requested with valid parameters
- **THEN** it returns status 200 with a JSON body and the content type `application/json`

#### Scenario: Unknown API path

- **WHEN** `/api/v1/palettes` is requested
- **THEN** a 404 error response is returned

### Requirement: Consistent resource shapes

A single resource SHALL be returned as `{ "data": <resource> }` and a list as `{ "data": [<resource>, ...], "count": <number of items> }`.

A color resource SHALL have every field a color has in `/assets/colors.json` (`index` from the flat list, `name`, `slug`, `cmyk_array`, `cmyk`, `rgb_array`, `rgb`, `hex`, `combinations`, `use_count`), with the same values, plus:
- `group`: its swatch group id, `a` to `f`
- `url`: the absolute URL of its page on the site
- `api_url`: the absolute URL of its `/api/v1/colors/{slug}` resource
- `card_url`: the absolute URL of its share card, `/swatch/{slug}/card.png`

A combination resource SHALL have:
- `number`
- `size`: its number of colors
- `colors`: its colors in the library's order, each with `name`, `slug`, `hex`, `url`, `api_url` and `card_url`
- `url`, `api_url` and `card_url` (`/combination/{n}/card.png`) for the combination itself

#### Scenario: Color list matches the public JSON

- **WHEN** `/api/v1/colors` is requested
- **THEN** `count` is 159, and each entry equals the entry at the same position in `/assets/colors.json` plus `group`, `url`, `api_url` and `card_url`

#### Scenario: Links resolve

- **WHEN** the `url`, `api_url` and `card_url` of any returned color or combination are requested
- **THEN** the `url` returns that resource's page with status 200, the `api_url` returns the same resource, and the `card_url` returns its share card as `image/png` with status 200

### Requirement: Single color includes its combinations

`/api/v1/colors/{slug}` SHALL return the color resource with one more field, `combination_details`: the full combination resource for each combination the color appears in, in ascending number. An unknown slug SHALL return a 404 error. One of alpha's seven punctuated slugs SHALL return the color under its normalized slug.

#### Scenario: Known color

- **WHEN** `/api/v1/colors/hermosa-pink` is requested
- **THEN** the color is Hermosa Pink with hex `#ffb3f0`, and `combination_details` holds combinations 176, 227 and 273 with their colors

#### Scenario: Legacy slug

- **WHEN** `/api/v1/colors/hay's-russet` is requested
- **THEN** the Hay's Russet color is returned, with slug `hays-russet`

#### Scenario: Unknown color

- **WHEN** `/api/v1/colors/not-a-color` is requested
- **THEN** a 404 error with the code `not_found` is returned

### Requirement: Color list filters

`/api/v1/colors` SHALL accept:
- `q`: name text, matched as the color library's name search does
- `group`: a group id from `a` to `f`

The two filters SHALL combine. A `group` outside `a` to `f` SHALL return a 400 error.

#### Scenario: Name search

- **WHEN** `/api/v1/colors?q=hays%20russet` is requested
- **THEN** the list holds Hay's Russet

#### Scenario: Group filter

- **WHEN** `/api/v1/colors?group=f` is requested
- **THEN** `count` is 6 and every color has group `f`

#### Scenario: Invalid group

- **WHEN** `/api/v1/colors?group=z` is requested
- **THEN** a 400 error with the code `invalid_parameter` naming `group` is returned

### Requirement: Combination list and lookup

`/api/v1/combinations` SHALL return all 348 combinations in ascending number. It SHALL accept:
- `colors`: a comma-separated list of one to four slugs, returning only the combinations that contain all of them
- `size`: 2, 3 or 4, returning only combinations of that size

`/api/v1/combinations/{n}` SHALL return combination `n` for `n` from 1 to 348. An unknown slug in `colors`, more than four slugs, or a `size` other than 2, 3 or 4 SHALL return a 400 error. A number outside 1–348, or one that is not an integer, SHALL return a 404 error.

#### Scenario: All combinations

- **WHEN** `/api/v1/combinations` is requested
- **THEN** `count` is 348, and there are 120 combinations of size 2, 120 of size 3 and 108 of size 4

#### Scenario: Combinations containing colors

- **WHEN** `/api/v1/combinations?colors=hermosa-pink` is requested
- **THEN** combinations 176, 227 and 273 are returned

#### Scenario: One combination

- **WHEN** `/api/v1/combinations/1` is requested
- **THEN** combination 1 is returned with English Red (`#de4500`) and Cerulian Blue (`#29bdad`)

#### Scenario: Out-of-range combination

- **WHEN** `/api/v1/combinations/349` is requested
- **THEN** a 404 error with the code `not_found` is returned

#### Scenario: Unknown color in filter

- **WHEN** `/api/v1/combinations?colors=hermosa-pink,not-a-color` is requested
- **THEN** a 400 error with the code `invalid_parameter` naming `not-a-color` is returned

### Requirement: Swatch groups

`/api/v1/groups` SHALL return the six groups in order. Each group SHALL have its `id` (`a` to `f`), its `count` of colors, and its colors' slugs in order.

#### Scenario: Group listing

- **WHEN** `/api/v1/groups` is requested
- **THEN** six groups are returned, with counts 38, 49, 23, 23, 20 and 6

### Requirement: Nearest colors

`/api/v1/nearest` SHALL take a required `hex` parameter and an optional `limit` from 1 to 20 (default 5). It SHALL return the nearest colors as the color library ranks them, each as a color resource with one more field, `distance`. A missing or invalid `hex`, or a `limit` outside 1–20, SHALL return a 400 error. The `#` of a hex value MAY be sent percent-encoded or left out.

#### Scenario: Nearest to an exact color

- **WHEN** `/api/v1/nearest?hex=ffb3f0&limit=3` is requested
- **THEN** three colors are returned, the first being Hermosa Pink with `distance` 0

#### Scenario: Missing hex

- **WHEN** `/api/v1/nearest` is requested with no `hex`
- **THEN** a 400 error with the code `invalid_parameter` naming `hex` is returned

### Requirement: Error responses

Every error SHALL be JSON of the form `{ "error": { "code": <code>, "message": <text> } }`, with the HTTP status matching the code:
- `invalid_parameter`: 400. The message names the parameter and what is accepted.
- `not_found`: 404
- `method_not_allowed`: 405, for any method other than `GET`, `HEAD` or `OPTIONS`

#### Scenario: Write method

- **WHEN** a `POST` is sent to `/api/v1/colors`
- **THEN** a 405 error with the code `method_not_allowed` is returned

### Requirement: Cross-origin access and caching

Every API response, errors included, SHALL allow requests from any origin (`Access-Control-Allow-Origin: *`), and an `OPTIONS` preflight SHALL succeed. Successful responses SHALL be cacheable by the CDN and by clients, since the data only changes when the site is deployed.

#### Scenario: Browser request from another site

- **WHEN** any endpoint is requested with an `Origin` header from another domain
- **THEN** the response includes `Access-Control-Allow-Origin: *`

#### Scenario: Cacheable success

- **WHEN** a successful API response is received
- **THEN** its `Cache-Control` header allows shared caching

### Requirement: OpenAPI description

`/api/v1/openapi.json` SHALL return a valid OpenAPI 3.1 document. It SHALL describe every endpoint, its parameters and their allowed values, the resource and error shapes, and each response status, with a description written for a reader who does not know the book. The live API's responses SHALL conform to it.

#### Scenario: Document is valid

- **WHEN** the document is checked with an OpenAPI 3.1 validator
- **THEN** it passes

#### Scenario: Responses conform

- **WHEN** a response from each endpoint, success and error, is checked against the schema the document gives for that endpoint and status
- **THEN** every response conforms

### Requirement: Agent-readable summary at /llms.txt

The site SHALL serve `/llms.txt` as plain-text Markdown in the llms.txt format. It SHALL:
- say what the dictionary is (159 colors, 348 combinations of two to four colors, from Sanzo Wada's book)
- list each API endpoint with an absolute example URL
- give the MCP server's URL
- link to the OpenAPI document
- describe the site's page URL patterns

#### Scenario: Summary is served

- **WHEN** `/llms.txt` is requested
- **THEN** a text response is returned that contains the absolute URLs of `/api/v1/openapi.json` and `/api/mcp`

### Requirement: Existing pages and public JSON are unaffected

Adding the API SHALL NOT change `/assets/colors.json` or any page URL, its content or its rendering.

#### Scenario: Public JSON unchanged

- **WHEN** `/assets/colors.json` is requested after the API is added
- **THEN** it is identical to its content before the change
