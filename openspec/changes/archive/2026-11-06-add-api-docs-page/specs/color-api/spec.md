# Spec Delta

## MODIFIED Requirements

### Requirement: OpenAPI description

`/api/v1/openapi.json` SHALL return a valid OpenAPI 3.1 document. It SHALL describe every endpoint, its parameters and their allowed values, the resource and error shapes, and each response status, with a description written for a reader who does not know the book. It SHALL link to the human-readable documentation page through `externalDocs`, with the page's absolute URL. The live API's responses SHALL conform to it.

#### Scenario: Document is valid

- **WHEN** the document is checked with an OpenAPI 3.1 validator
- **THEN** it passes

#### Scenario: Responses conform

- **WHEN** a response from each endpoint, success and error, is checked against the schema the document gives for that endpoint and status
- **THEN** every response conforms

#### Scenario: Links to the docs page

- **WHEN** the document is requested
- **THEN** its `externalDocs.url` is the absolute URL of `/api`

### Requirement: Agent-readable summary at /llms.txt

The site SHALL serve `/llms.txt` as plain-text Markdown in the llms.txt format. It SHALL:
- say what the dictionary is (159 colors, 348 combinations of two to four colors, from Sanzo Wada's book)
- list each API endpoint with an absolute example URL
- give the MCP server's URL
- link to the OpenAPI document
- link to the human-readable documentation page at `/api`
- describe the site's page URL patterns

#### Scenario: Summary is served

- **WHEN** `/llms.txt` is requested
- **THEN** a text response is returned that contains the absolute URLs of `/api/v1/openapi.json`, `/api/mcp` and `/api`
