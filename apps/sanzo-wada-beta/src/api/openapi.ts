import { z } from 'zod'
import { endpoints } from './endpoints'
import { apiRegistry } from './schemas'

export const API_DESCRIPTION =
  "Read-only data from Sanzo Wada's A Dictionary of Color Combinations (1933): 159 colors, each with CMYK values from the book and derived RGB and hex, and 348 combinations of two to four colors. Colors are identified by slug and combinations by number. Every resource links to its page on the website (url) and to itself in this API (api_url)."

const ref = (id: string) => ({ $ref: `#/components/schemas/${id}` })

// zod emits standalone documents; components need neither $schema nor $id
export const componentSchemas = (): Record<string, unknown> => {
  const { schemas } = z.toJSONSchema(apiRegistry, {
    target: 'draft-2020-12',
    uri: (id) => `#/components/schemas/${id}`,
  })
  return Object.fromEntries(
    Object.entries(schemas).map(([id, schema]) => {
      const { $schema: _schema, $id: _id, ...rest } = schema as Record<string, unknown>
      return [id, rest]
    })
  )
}

const errorResponse = (description: string) => ({
  description,
  content: { 'application/json': { schema: ref('Error') } },
})

export const openApiDocument = (origin: string) => ({
  openapi: '3.1.0',
  info: {
    title: 'Sanzo Wada Color Dictionary API',
    version: '1.0.0',
    description: `${API_DESCRIPTION} An MCP server with the same data is at ${origin}/api/mcp.`,
  },
  servers: [{ url: origin }],
  externalDocs: {
    description: 'Documentation for the REST API and the MCP server',
    url: `${origin}/api`,
  },
  paths: Object.fromEntries(
    endpoints.map((endpoint) => {
      const item = ref(endpoint.item)
      const body = endpoint.isList
        ? {
            type: 'object',
            properties: {
              data: { type: 'array', items: item },
              count: { type: 'integer' },
            },
            required: ['data', 'count'],
          }
        : { type: 'object', properties: { data: item }, required: ['data'] }
      return [
        endpoint.path,
        {
          get: {
            operationId: endpoint.operationId,
            summary: endpoint.summary,
            description: endpoint.description,
            parameters: endpoint.parameters,
            responses: {
              200: {
                description: 'Success',
                content: { 'application/json': { schema: body } },
              },
              ...(endpoint.errors.includes(400) && {
                400: errorResponse(
                  'A parameter is missing or invalid (code invalid_parameter)'
                ),
              }),
              ...(endpoint.errors.includes(404) && {
                404: errorResponse('No such resource (code not_found)'),
              }),
              405: errorResponse(
                'Method other than GET, HEAD or OPTIONS (code method_not_allowed)'
              ),
            },
          },
        },
      ]
    })
  ),
  components: { schemas: componentSchemas() },
})
