import { getCombination, groupOf, groups } from '@/colors'
import type {
  Color,
  Combination,
  CombinationColor,
  GroupSummary,
  NearestColor,
} from '@/colors'
import type {
  ColorDetailResource,
  ColorResource,
  CombinationResource,
  GroupResource,
  NearestColorResource,
} from './schemas'

// REST handlers and MCP tools both build their output here, so the two
// interfaces always return the same resources. Links use the request origin.

const colorLinks = (slug: string, origin: string) => ({
  url: `${origin}/swatch/${slug}`,
  api_url: `${origin}/api/v1/colors/${slug}`,
})

const groupFor = (slug: string) => {
  const group = groupOf(slug)
  if (!group) throw new Error(`Color "${slug}" is in no swatch group`)
  return group
}

export const toColorResource = (color: Color, origin: string): ColorResource => ({
  ...color,
  cmyk_array: [...color.cmyk_array],
  rgb_array: [...color.rgb_array],
  combinations: [...color.combinations],
  group: groupFor(color.slug),
  ...colorLinks(color.slug, origin),
})

const toCombinationColor = (color: CombinationColor, origin: string) => ({
  name: color.name,
  slug: color.slug,
  hex: color.hex,
  ...colorLinks(color.slug, origin),
})

export const toCombinationResource = (
  combination: Combination,
  origin: string
): CombinationResource => ({
  number: combination.number,
  size: combination.colors.length,
  colors: combination.colors.map((color) => toCombinationColor(color, origin)),
  url: `${origin}/combination/${combination.number}`,
  api_url: `${origin}/api/v1/combinations/${combination.number}`,
})

export const toColorDetail = (color: Color, origin: string): ColorDetailResource => ({
  ...toColorResource(color, origin),
  combination_details: color.combinations
    .map((n) => getCombination(n))
    .filter((combination) => combination !== undefined)
    .sort((a, b) => a.number - b.number)
    .map((combination) => toCombinationResource(combination, origin)),
})

export const toGroupResource = (group: GroupSummary): GroupResource => ({
  id: group.id,
  count: group.count,
  colors: [...group.slugs],
})

export const allGroupResources = (): GroupResource[] => groups.map(toGroupResource)

export const toNearestResource = (
  { color, distance }: NearestColor,
  origin: string
): NearestColorResource => ({ ...toColorResource(color, origin), distance })
