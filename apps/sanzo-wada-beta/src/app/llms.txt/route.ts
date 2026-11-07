import { COMBINATION_COUNT, allColors } from '@/colors'
import { CACHE_OK, originOf } from '@/api/http'
import { endpoints } from '@/api/endpoints'
import { API_DESCRIPTION } from '@/api/openapi'

// A plain-text summary for language models (https://llmstxt.org)
export function GET(request: Request) {
  const origin = originOf(request)
  const text = `# Wada Sanzo: A Dictionary of Color Combinations

> An interactive edition of Sanzo Wada's 1933 book: ${allColors.length} colors and ${COMBINATION_COUNT} combinations of two to four colors, with a read-only REST API and an MCP server.

${API_DESCRIPTION}

## MCP server

- [MCP server](${origin}/api/mcp): Streamable HTTP, no authentication. Tools: search_colors, get_color, get_combination, find_combinations, nearest_colors. Resources: sanzo://colors/{slug} and sanzo://combinations/{n}.

## REST API

- [OpenAPI 3.1 description](${origin}/api/v1/openapi.json): every endpoint, parameter and response shape
${endpoints.map((endpoint) => `- [${endpoint.summary}](${origin}${endpoint.example}): GET ${endpoint.path}. ${endpoint.description}`).join('\n')}

Responses are JSON: \`{ "data": ... }\` for one resource, \`{ "data": [...], "count": n }\` for a list, and \`{ "error": { "code", "message" } }\` with status 400, 404 or 405 for errors. Any origin may call the API.

## Website

- [Index](${origin}/): all colors, as swatches or a list
- [Color page](${origin}/swatch/hermosa-pink): /swatch/{slug}
- [Combination page](${origin}/combination/1): /combination/{n}, n from 1 to ${COMBINATION_COUNT}
- [About](${origin}/about): Sanzo Wada and the book

## Optional

- [All colors as one JSON file](${origin}/assets/colors.json): the original public JSON, a \`colors\` array
`
  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': CACHE_OK,
    },
  })
}
