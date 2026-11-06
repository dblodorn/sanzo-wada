import {
  McpServer,
  ResourceNotFoundError,
  ResourceTemplate,
} from '@modelcontextprotocol/server'
import type { CallToolResult } from '@modelcontextprotocol/server'
import { z } from 'zod'
import {
  COMBINATION_COUNT,
  allColors,
  combinationNumbers,
  combinationsWith,
  getColorBySlug,
  getCombination,
  legacySlugs,
  nearestColors,
  normalizeHex,
  searchColors,
} from '@/colors'
import type { Color } from '@/colors'
import {
  toColorDetail,
  toColorResource,
  toCombinationResource,
  toNearestResource,
} from '@/api/resources'
import {
  colorDetailSchema,
  colorSchema,
  combinationSchema,
  groupIdSchema,
  list,
  nearestColorSchema,
  single,
} from '@/api/schemas'
import type {
  ColorDetailResource,
  ColorResource,
  CombinationResource,
  NearestColorResource,
} from '@/api/schemas'
import { suggestSlugs } from './suggest'

const INSTRUCTIONS = `Data from Sanzo Wada's A Dictionary of Color Combinations (1933): ${allColors.length} colors and ${COMBINATION_COUNT} combinations of two to four colors. Colors are identified by slug (for example hermosa-pink) and combinations by number (1 to ${COMBINATION_COUNT}). Use search_colors or nearest_colors to find colors, get_color for a color's combinations, and find_combinations for palettes that include given colors. Every result links to its page on the website, which you can cite.`

const READ_ONLY = { readOnlyHint: true, idempotentHint: true, openWorldHint: false }

// Text summaries a model can answer and cite from without reading the structure
const colorLine = (color: { name: string; hex: string; url: string }) =>
  `${color.name} ${color.hex}`
const combinationLine = (combination: CombinationResource) =>
  `Combination ${combination.number}: ${combination.colors.map(colorLine).join(', ')} — ${combination.url}`
const colorListText = (colors: readonly ColorResource[]) =>
  colors.map((color) => `- ${colorLine(color)} (${color.slug}) — ${color.url}`).join('\n')

const result = (
  structuredContent: Record<string, unknown>,
  text: string
): CallToolResult => ({
  structuredContent,
  content: [{ type: 'text', text }],
})

const toolError = (text: string): CallToolResult => ({
  isError: true,
  content: [{ type: 'text', text }],
})

const unknownSlugError = (slug: string) => {
  const suggestions = suggestSlugs(slug)
  return toolError(
    `"${slug}" is not a color slug.${suggestions.length ? ` Did you mean ${suggestions.join(', ')}?` : ''} Use search_colors to find slugs.`
  )
}

const findColor = (slug: string): Color | undefined =>
  getColorBySlug(legacySlugs[slug] ?? slug)

const NUMBER_MESSAGE = `must be from 1 to ${COMBINATION_COUNT}`
const LIMIT_MESSAGE = 'must be from 1 to 20'

// One server per request: the factory receives the request origin for links
export const createServer = (origin: string): McpServer => {
  const server = new McpServer(
    { name: 'sanzo-wada', version: '1.0.0', title: 'Sanzo Wada Color Dictionary' },
    { instructions: INSTRUCTIONS }
  )

  server.registerTool(
    'search_colors',
    {
      title: 'Search colors',
      description:
        'List colors from the book, optionally filtered by name text (case and punctuation are ignored) and by swatch group a–f. With no arguments, returns all 159 colors in book order.',
      inputSchema: z.object({
        query: z
          .string()
          .max(100)
          .optional()
          .describe('Text the color name must contain'),
        group: groupIdSchema.optional(),
        limit: z
          .int()
          .min(1)
          .max(159)
          .optional()
          .describe('Return at most this many colors'),
      }),
      outputSchema: list(colorSchema),
      annotations: READ_ONLY,
    },
    async ({ query, group, limit }) => {
      const colors = searchColors(query, group)
        .slice(0, limit)
        .map((color) => toColorResource(color, origin))
      const text = colors.length
        ? `${colors.length} colors:\n${colorListText(colors)}`
        : 'No colors match. Try a shorter query or nearest_colors with a hex value.'
      return result({ data: colors, count: colors.length }, text)
    }
  )

  server.registerTool(
    'get_color',
    {
      title: 'Get a color',
      description:
        "Get one color by slug: its CMYK, RGB and hex values and every combination it appears in, with those combinations' colors.",
      inputSchema: z.object({
        slug: z.string().min(1).describe('Color slug, for example hermosa-pink'),
      }),
      outputSchema: single(colorDetailSchema),
      annotations: READ_ONLY,
    },
    async ({ slug }) => {
      const color = findColor(slug)
      if (!color) return unknownSlugError(slug)
      const detail: ColorDetailResource = toColorDetail(color, origin)
      const text = [
        `${colorLine(detail)} — ${detail.cmyk}, ${detail.rgb}, swatch group ${detail.group} — ${detail.url}`,
        `Appears in ${detail.combination_details.length} combinations:`,
        ...detail.combination_details.map(
          (combination) => `- ${combinationLine(combination)}`
        ),
      ].join('\n')
      return result({ data: detail }, text)
    }
  )

  server.registerTool(
    'get_combination',
    {
      title: 'Get a combination',
      description: `Get combination number 1 to ${COMBINATION_COUNT}: its two to four colors in the order the book lists them.`,
      inputSchema: z.object({
        number: z
          .int({ error: NUMBER_MESSAGE })
          .min(1, { error: NUMBER_MESSAGE })
          .max(COMBINATION_COUNT, { error: NUMBER_MESSAGE })
          .describe('Combination number'),
      }),
      outputSchema: single(combinationSchema),
      annotations: READ_ONLY,
    },
    async ({ number }) => {
      const combination = getCombination(number)
      if (!combination) return toolError(`number ${NUMBER_MESSAGE}`)
      const resource = toCombinationResource(combination, origin)
      return result({ data: resource }, combinationLine(resource))
    }
  )

  server.registerTool(
    'find_combinations',
    {
      title: 'Find combinations containing colors',
      description:
        'Find every combination that contains all of the given colors, optionally only those of a given size. Use it to find palettes built around a color.',
      inputSchema: z.object({
        colors: z
          .array(z.string().min(1))
          .min(1)
          .max(4)
          .describe('One to four color slugs that must all be in the combination'),
        size: z.int().min(2).max(4).optional().describe('Number of colors, 2 to 4'),
      }),
      outputSchema: list(combinationSchema),
      annotations: READ_ONLY,
    },
    async ({ colors, size }) => {
      const slugs = colors.map((slug) => legacySlugs[slug] ?? slug)
      const found = combinationsWith(slugs, size)
      if ('unknownSlug' in found) return unknownSlugError(found.unknownSlug)
      const combinations = found.combinations.map((combination) =>
        toCombinationResource(combination, origin)
      )
      const text = combinations.length
        ? `${combinations.length} combinations contain ${slugs.join(', ')}:\n${combinations.map((combination) => `- ${combinationLine(combination)}`).join('\n')}`
        : `No combination contains all of ${slugs.join(', ')}.`
      return result({ data: combinations, count: combinations.length }, text)
    }
  )

  server.registerTool(
    'nearest_colors',
    {
      title: 'Nearest colors to a hex value',
      description:
        'Match any color to the book: ranks all colors by CIEDE2000 color difference from the given hex value, nearest first. A distance of 0 is identical; under about 5 is close.',
      inputSchema: z.object({
        hex: z.string().describe('Hex color as #rgb, rgb, #rrggbb or rrggbb'),
        limit: z
          .int({ error: LIMIT_MESSAGE })
          .min(1, { error: LIMIT_MESSAGE })
          .max(20, { error: LIMIT_MESSAGE })
          .default(5)
          .describe('How many colors to return'),
      }),
      outputSchema: list(nearestColorSchema),
      annotations: READ_ONLY,
    },
    async ({ hex, limit }) => {
      const nearest = nearestColors(hex, limit)
      if (!nearest)
        return toolError(`hex "${hex}" must be a hex color: #rgb, rgb, #rrggbb or rrggbb`)
      const colors: NearestColorResource[] = nearest.map((entry) =>
        toNearestResource(entry, origin)
      )
      const text = `Nearest colors to ${normalizeHex(hex)}:\n${colors.map((color) => `- ${colorLine(color)} (distance ${color.distance}) — ${color.url}`).join('\n')}`
      return result({ data: colors, count: colors.length }, text)
    }
  )

  const json = (uri: URL, data: unknown) => ({
    contents: [
      { uri: uri.href, mimeType: 'application/json', text: JSON.stringify(data) },
    ],
  })
  const variable = (value: string | string[]) => (Array.isArray(value) ? value[0] : value)

  server.registerResource(
    'color',
    new ResourceTemplate('sanzo://colors/{slug}', {
      list: () => ({
        resources: allColors.map((color) => ({
          uri: `sanzo://colors/${color.slug}`,
          name: color.name,
          mimeType: 'application/json',
        })),
      }),
    }),
    {
      title: 'Color',
      description: 'A color with its values and combinations',
      mimeType: 'application/json',
    },
    (uri, { slug }) => {
      const color = findColor(variable(slug))
      if (!color) throw new ResourceNotFoundError(uri.href)
      return json(uri, toColorDetail(color, origin))
    }
  )

  server.registerResource(
    'combination',
    new ResourceTemplate('sanzo://combinations/{n}', {
      list: () => ({
        resources: combinationNumbers().map((n) => ({
          uri: `sanzo://combinations/${n}`,
          name: `Combination ${n}`,
          mimeType: 'application/json',
        })),
      }),
    }),
    {
      title: 'Combination',
      description: 'A combination with its colors',
      mimeType: 'application/json',
    },
    (uri, { n }) => {
      const value = variable(n)
      const combination = /^[0-9]+$/.test(value)
        ? getCombination(Number(value))
        : undefined
      if (!combination) throw new ResourceNotFoundError(uri.href)
      return json(uri, toCombinationResource(combination, origin))
    }
  )

  return server
}
