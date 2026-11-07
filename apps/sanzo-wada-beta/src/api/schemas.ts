import { z } from 'zod'
import { COMBINATION_COUNT, normalizeHex } from '@/colors'

// One definition per shape: the TypeScript types, request parsing, the OpenAPI
// components and the MCP tool schemas all come from these.
export const apiRegistry = z.registry<{ id: string; description?: string }>()

export const GROUP_ID_VALUES = ['a', 'b', 'c', 'd', 'e', 'f'] as const
export const groupIdSchema = z
  .enum(GROUP_ID_VALUES, { error: 'must be one of a, b, c, d, e, f' })
  .describe('Swatch group id. The book groups its colors into six sections, a to f.')
  .register(apiRegistry, { id: 'GroupId' })

const hexSchema = z
  .string()
  .regex(/^#[0-9a-f]{6}$/)
  .describe('Hex color, lowercase, as #rrggbb')

const links = {
  url: z.url().describe("Absolute URL of the resource's page on the website"),
  api_url: z.url().describe('Absolute URL of this resource in the REST API'),
  card_url: z
    .url()
    .describe('Absolute URL of the share card, a 1200 × 630 PNG of the colors'),
}

const unit = z.number().min(0).max(100)
const channel = z.int().min(0).max(255)

export const colorSchema = z
  .object({
    index: z.int().min(1).describe('Position in the list of all 159 colors, from 1'),
    name: z.string().describe('Color name as printed in the book'),
    slug: z.string().describe('URL-safe identifier, used in page and API URLs'),
    cmyk_array: z
      .tuple([unit, unit, unit, unit])
      .describe('CMYK values from the book, 0–100'),
    cmyk: z.string().describe('CMYK as text, for example "C:0 / M:30 / Y:6 / K:0"'),
    rgb_array: z
      .tuple([channel, channel, channel])
      .describe('RGB converted from CMYK, 0–255'),
    rgb: z.string().describe('RGB as text, for example "R:255 / G:179 / B:240"'),
    hex: hexSchema,
    combinations: z
      .array(z.int().min(1).max(COMBINATION_COUNT))
      .describe('Numbers of the combinations this color appears in'),
    use_count: z.int().min(0).describe('How many combinations the color appears in'),
    group: groupIdSchema,
    ...links,
  })
  .register(apiRegistry, {
    id: 'Color',
    description: 'One of the 159 colors in the book',
  })

export const combinationColorSchema = z
  .object({ name: z.string(), slug: z.string(), hex: hexSchema, ...links })
  .register(apiRegistry, {
    id: 'CombinationColor',
    description: 'A color within a combination',
  })

export const combinationSchema = z
  .object({
    number: z
      .int()
      .min(1)
      .max(COMBINATION_COUNT)
      .describe('Combination number, 1 to 348'),
    size: z.int().min(2).max(4).describe('Number of colors in the combination'),
    colors: z
      .array(combinationColorSchema)
      .describe('The colors, in the order the book lists them'),
    ...links,
  })
  .register(apiRegistry, {
    id: 'Combination',
    description: 'One of the 348 combinations of two to four colors in the book',
  })

export const colorDetailSchema = colorSchema
  .extend({
    combination_details: z
      .array(combinationSchema)
      .describe('Every combination the color appears in, in ascending number'),
  })
  .register(apiRegistry, {
    id: 'ColorDetail',
    description: 'A color with its combinations',
  })

export const groupSchema = z
  .object({
    id: groupIdSchema,
    count: z.int().min(1).describe('Number of colors in the group'),
    colors: z.array(z.string()).describe('Slugs of the colors in the group, in order'),
  })
  .register(apiRegistry, {
    id: 'Group',
    description: 'A swatch group (section of the book)',
  })

export const nearestColorSchema = colorSchema
  .extend({
    distance: z
      .number()
      .min(0)
      .describe('CIEDE2000 color difference from the requested hex, 0 is identical'),
  })
  .register(apiRegistry, {
    id: 'NearestColor',
    description: 'A color ranked by closeness',
  })

export const ERROR_CODES = [
  'invalid_parameter',
  'not_found',
  'method_not_allowed',
] as const
export type ErrorCode = (typeof ERROR_CODES)[number]

export const errorSchema = z
  .object({
    error: z.object({
      code: z.enum(ERROR_CODES),
      message: z.string().describe('What went wrong and what is accepted'),
    }),
  })
  .register(apiRegistry, { id: 'Error', description: 'Error response' })

export const single = <T extends z.ZodType>(item: T) => z.object({ data: item })
export const list = <T extends z.ZodType>(item: T) =>
  z.object({ data: z.array(item), count: z.int().min(0) })

export type ColorResource = z.infer<typeof colorSchema>
export type ColorDetailResource = z.infer<typeof colorDetailSchema>
export type CombinationResource = z.infer<typeof combinationSchema>
export type GroupResource = z.infer<typeof groupSchema>
export type NearestColorResource = z.infer<typeof nearestColorSchema>

// Query parameters. Messages are shown after the parameter name.
export const colorsQuerySchema = z.object({
  q: z.string().max(100, { error: 'must be at most 100 characters' }).optional(),
  group: groupIdSchema.optional(),
})

export const combinationsQuerySchema = z.object({
  colors: z
    .string()
    .transform((value) =>
      value
        .split(',')
        .map((slug) => slug.trim())
        .filter(Boolean)
    )
    .pipe(
      z
        .array(z.string())
        .min(1, { error: 'must list one to four color slugs, comma-separated' })
        .max(4, { error: 'must list one to four color slugs, comma-separated' })
    )
    .optional(),
  size: z
    .enum(['2', '3', '4'], { error: 'must be 2, 3 or 4' })
    .transform(Number)
    .optional(),
})

const LIMIT_MESSAGE = 'must be an integer from 1 to 20'
export const nearestQuerySchema = z.object({
  hex: z
    .string({ error: 'is required: a hex color such as 3a5f8c or #3a5f8c' })
    .refine((value) => normalizeHex(value) !== undefined, {
      error: 'must be a hex color: #rgb, rgb, #rrggbb or rrggbb',
    }),
  limit: z.coerce
    .number({ error: LIMIT_MESSAGE })
    .int({ error: LIMIT_MESSAGE })
    .min(1, { error: LIMIT_MESSAGE })
    .max(20, { error: LIMIT_MESSAGE })
    .default(5),
})
