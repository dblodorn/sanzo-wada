import { z } from 'zod'
import { resourceTemplates, toolDefinitions } from '@/mcp/tools'
import { endpoints } from './endpoints'
import { API_DESCRIPTION, componentSchemas } from './openapi'

// The /api page's content, built from the same sources as the OpenAPI document
// and the MCP server so the page cannot drift from either

type JsonSchema = {
  type?: string
  $ref?: string
  enum?: readonly unknown[]
  items?: JsonSchema
  prefixItems?: readonly JsonSchema[]
  minimum?: number
  maximum?: number
  minItems?: number
  maxItems?: number
  maxLength?: number
  format?: string
  default?: unknown
  description?: string
  properties?: Record<string, JsonSchema>
  required?: readonly string[]
}

export interface DocField {
  readonly name: string
  readonly type: string
  readonly required: boolean
  readonly description: string
}

export interface DocEndpoint {
  readonly id: string
  readonly path: string
  readonly summary: string
  readonly description: string
  readonly parameters: readonly (DocField & { readonly in: string })[]
  readonly returns: string
  readonly errors: readonly number[]
  readonly example: string
}

export interface DocSchema {
  readonly id: string
  readonly description: string
  // Set when the schema is another one plus the listed fields
  readonly extends?: string
  readonly fields: readonly DocField[]
}

export interface DocTool {
  readonly name: string
  readonly title: string
  readonly description: string
  readonly inputs: readonly DocField[]
}

export interface DocResourceTemplate {
  readonly name: string
  readonly uriTemplate: string
  readonly title: string
  readonly description: string
}

export interface ApiDocs {
  readonly description: string
  readonly mcpUrl: string
  readonly endpoints: readonly DocEndpoint[]
  readonly schemas: readonly DocSchema[]
  readonly tools: readonly DocTool[]
  readonly resourceTemplates: readonly DocResourceTemplate[]
}

const schemas = componentSchemas() as Record<string, JsonSchema>
const refId = (ref: string) => ref.split('/').pop() ?? ref

// Integers default to the largest safe integer when unbounded; that's no limit
const range = (schema: JsonSchema) => {
  const { minimum: min, maximum: max } = schema
  const hasMax = max !== undefined && max < Number.MAX_SAFE_INTEGER
  if (min !== undefined && hasMax) return ` ${min}–${max}`
  if (hasMax) return ` ≤ ${max}`
  if (min !== undefined && min > 0) return ` ≥ ${min}`
  return ''
}

const typeLabel = (schema: JsonSchema): string => {
  if (schema.$ref) {
    const target = schemas[refId(schema.$ref)]
    return target?.enum ? typeLabel(target) : refId(schema.$ref)
  }
  if (schema.enum) return schema.enum.join(' | ')
  if (schema.prefixItems) return `[${schema.prefixItems.map(typeLabel).join(', ')}]`
  if (schema.type === 'array') {
    const items = schema.items ? typeLabel(schema.items) : 'any'
    const count =
      schema.minItems !== undefined && schema.maxItems !== undefined
        ? `, ${schema.minItems}–${schema.maxItems} items`
        : ''
    return `${items}[]${count}`
  }
  if (schema.type === 'integer' || schema.type === 'number')
    return `${schema.type}${range(schema)}`
  if (schema.format === 'uri') return 'URL'
  return schema.type ?? 'any'
}

const describe = (schema: JsonSchema) => {
  const own =
    schema.description ??
    (schema.$ref ? schemas[refId(schema.$ref)]?.description ?? '' : '')
  return schema.default === undefined ? own : `${own} (default ${schema.default})`
}

const fieldsOf = (schema: JsonSchema): DocField[] =>
  Object.entries(schema.properties ?? {}).map(([name, property]) => ({
    name,
    type: typeLabel(property),
    required: schema.required?.includes(name) ?? false,
    description: describe(property),
  }))

// Resources shown as field tables; ColorDetail and NearestColor are Color plus a field
const SCHEMA_IDS = [
  'Color',
  'ColorDetail',
  'NearestColor',
  'Combination',
  'CombinationColor',
  'Group',
]

const docSchema = (id: string): DocSchema => {
  const schema = schemas[id]
  const fields = fieldsOf(schema)
  const base = id === 'Color' ? undefined : fieldsOf(schemas.Color)
  const extendsColor =
    base !== undefined &&
    base.every((field) => fields.some((own) => own.name === field.name))
  return {
    id,
    description: schema.description ?? '',
    ...(extendsColor && { extends: 'Color' }),
    fields: extendsColor
      ? fields.filter((field) => !base.some((own) => own.name === field.name))
      : fields,
  }
}

export const apiDocs = (origin: string): ApiDocs => ({
  description: API_DESCRIPTION,
  mcpUrl: `${origin}/api/mcp`,
  endpoints: endpoints.map((endpoint) => ({
    id: endpoint.operationId,
    path: endpoint.path,
    summary: endpoint.summary,
    description: endpoint.description,
    parameters: endpoint.parameters.map((parameter) => ({
      name: parameter.name,
      in: parameter.in,
      type: typeLabel(parameter.schema as JsonSchema),
      required: parameter.required,
      description: parameter.description,
    })),
    returns: endpoint.isList ? `a list of ${endpoint.item}` : `one ${endpoint.item}`,
    errors: endpoint.errors,
    example: endpoint.example,
  })),
  schemas: SCHEMA_IDS.map(docSchema),
  tools: Object.entries(toolDefinitions).map(([name, tool]) => ({
    name,
    title: tool.title,
    description: tool.description,
    inputs: fieldsOf(
      z.toJSONSchema(tool.inputSchema, {
        io: 'input',
        unrepresentable: 'any',
      }) as JsonSchema
    ),
  })),
  resourceTemplates: Object.entries(resourceTemplates).map(([name, template]) => ({
    name,
    uriTemplate: template.uriTemplate,
    title: template.title,
    description: template.description,
  })),
})
