import { z } from 'zod'
import { COMBINATION_COUNT } from '@/colors'
import { groupIdSchema } from '@/api/schemas'

// What the MCP server offers, described once for the server and the /api page

export const NUMBER_MESSAGE = `must be from 1 to ${COMBINATION_COUNT}`
export const LIMIT_MESSAGE = 'must be from 1 to 20'

// In the order the server registers them
export const toolDefinitions = {
  search_colors: {
    title: 'Search colors',
    description:
      'List colors from the book, optionally filtered by name text (case and punctuation are ignored) and by swatch group a–f. With no arguments, returns all 159 colors in book order.',
    inputSchema: z.object({
      query: z.string().max(100).optional().describe('Text the color name must contain'),
      group: groupIdSchema.optional(),
      limit: z
        .int()
        .min(1)
        .max(159)
        .optional()
        .describe('Return at most this many colors'),
    }),
  },
  get_color: {
    title: 'Get a color',
    description:
      "Get one color by slug: its CMYK, RGB and hex values and every combination it appears in, with those combinations' colors.",
    inputSchema: z.object({
      slug: z.string().min(1).describe('Color slug, for example hermosa-pink'),
    }),
  },
  get_combination: {
    title: 'Get a combination',
    description: `Get combination number 1 to ${COMBINATION_COUNT}: its two to four colors in the order the book lists them.`,
    inputSchema: z.object({
      number: z
        .int({ error: NUMBER_MESSAGE })
        .min(1, { error: NUMBER_MESSAGE })
        .max(COMBINATION_COUNT, { error: NUMBER_MESSAGE })
        .describe('Combination number'),
    }),
  },
  find_combinations: {
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
  },
  nearest_colors: {
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
  },
} as const

export const resourceTemplates = {
  color: {
    uriTemplate: 'sanzo://colors/{slug}',
    title: 'Color',
    description: 'A color with its values and combinations',
    mimeType: 'application/json',
  },
  combination: {
    uriTemplate: 'sanzo://combinations/{n}',
    title: 'Combination',
    description: 'A combination with its colors',
    mimeType: 'application/json',
  },
} as const
