// The REST endpoints, described once for both the OpenAPI document and /llms.txt

export interface EndpointParameter {
  readonly name: string
  readonly in: 'path' | 'query'
  readonly required: boolean
  readonly description: string
  readonly schema: Record<string, unknown>
}

export interface Endpoint {
  readonly path: string
  readonly operationId: string
  readonly summary: string
  readonly description: string
  readonly parameters: readonly EndpointParameter[]
  // Component name of the item, and whether the response is a list of them
  readonly item: string
  readonly isList: boolean
  readonly errors: readonly (400 | 404)[]
  // A working example, relative to the origin
  readonly example: string
}

export const endpoints: readonly Endpoint[] = [
  {
    path: '/api/v1/colors',
    operationId: 'listColors',
    summary: 'List or search colors',
    description:
      'All 159 colors in book order, optionally filtered by name and swatch group. Name matching ignores case and punctuation, so "hays russet" finds "Hay\'s Russet".',
    parameters: [
      {
        name: 'q',
        in: 'query',
        required: false,
        description: 'Text the color name must contain',
        schema: { type: 'string', maxLength: 100 },
      },
      {
        name: 'group',
        in: 'query',
        required: false,
        description: 'Only colors in this swatch group',
        schema: { $ref: '#/components/schemas/GroupId' },
      },
    ],
    item: 'Color',
    isList: true,
    errors: [400],
    example: '/api/v1/colors?q=pink',
  },
  {
    path: '/api/v1/colors/{slug}',
    operationId: 'getColor',
    summary: 'Get one color and its combinations',
    description:
      "A color by slug, with every combination it appears in. Alpha's old punctuated slugs (for example hay's-russet) are accepted and return the color under its current slug.",
    parameters: [
      {
        name: 'slug',
        in: 'path',
        required: true,
        description: 'Color slug, for example hermosa-pink',
        schema: { type: 'string' },
      },
    ],
    item: 'ColorDetail',
    isList: false,
    errors: [404],
    example: '/api/v1/colors/hermosa-pink',
  },
  {
    path: '/api/v1/combinations',
    operationId: 'listCombinations',
    summary: 'List combinations, or find those containing given colors',
    description:
      'All 348 combinations in ascending number. With colors, only the combinations that contain every listed color. With size, only combinations of that many colors.',
    parameters: [
      {
        name: 'colors',
        in: 'query',
        required: false,
        description: 'One to four color slugs, comma-separated',
        schema: { type: 'string' },
      },
      {
        name: 'size',
        in: 'query',
        required: false,
        description: 'Number of colors in the combination',
        schema: { type: 'integer', enum: [2, 3, 4] },
      },
    ],
    item: 'Combination',
    isList: true,
    errors: [400],
    example: '/api/v1/combinations?colors=hermosa-pink',
  },
  {
    path: '/api/v1/combinations/{n}',
    operationId: 'getCombination',
    summary: 'Get one combination',
    description:
      'Combination n, 1 to 348, with its colors in the order the book lists them.',
    parameters: [
      {
        name: 'n',
        in: 'path',
        required: true,
        description: 'Combination number',
        schema: { type: 'integer', minimum: 1, maximum: 348 },
      },
    ],
    item: 'Combination',
    isList: false,
    errors: [404],
    example: '/api/v1/combinations/1',
  },
  {
    path: '/api/v1/groups',
    operationId: 'listGroups',
    summary: 'List the swatch groups',
    description: 'The six sections of the book, a to f, with their colors in order.',
    parameters: [],
    item: 'Group',
    isList: true,
    errors: [],
    example: '/api/v1/groups',
  },
  {
    path: '/api/v1/nearest',
    operationId: 'nearestColors',
    summary: 'Find the colors nearest to any hex color',
    description:
      'Ranks all colors by CIEDE2000 color difference from the given hex, nearest first. Use it to match an arbitrary color to the book.',
    parameters: [
      {
        name: 'hex',
        in: 'query',
        required: true,
        description:
          'Hex color as #rgb, rgb, #rrggbb or rrggbb (send # as %23 or leave it out)',
        schema: { type: 'string' },
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        description: 'How many colors to return',
        schema: { type: 'integer', minimum: 1, maximum: 20, default: 5 },
      },
    ],
    item: 'NearestColor',
    isList: true,
    errors: [400],
    example: '/api/v1/nearest?hex=3a5f8c',
  },
]
