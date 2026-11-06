import colors from './colors'
import { parseRawColors } from './parse'
import type { Color, Combination, RawColor, SwatchGroup } from './types'
import { swatches_a } from './swatches_a.json'
import { swatches_b } from './swatches_b.json'
import { swatches_c } from './swatches_c.json'
import { swatches_d } from './swatches_d.json'
import { swatches_e } from './swatches_e.json'
import { swatches_f } from './swatches_f.json'

export type * from './types'
export { legacySlugs } from './legacySlugs'

export const COMBINATION_COUNT = 348

const swatchLists: RawColor[][] = [
  parseRawColors('a', swatches_a),
  parseRawColors('b', swatches_b),
  parseRawColors('c', swatches_c),
  parseRawColors('d', swatches_d),
  parseRawColors('e', swatches_e),
  parseRawColors('f', swatches_f),
]

// Grouped list: index restarts at 1 in each group (alpha's swatchArray)
export const swatchGroups: SwatchGroup[] = swatchLists.map((e) => ({ swatches: colors(e) }))

// Flat list: index runs 1–159 across all groups (alpha's swatchArrayAll)
export const allColors: Color[] = colors(swatchLists.flat())

// Slugs are URLs, so a duplicate fails the build rather than hiding a color
const colorsBySlug = new Map<string, Color>()
for (const color of allColors) {
  const existing = colorsBySlug.get(color.slug)
  if (existing) {
    throw new Error(
      `Slug "${color.slug}" is used by both "${existing.name}" and "${color.name}"`
    )
  }
  colorsBySlug.set(color.slug, color)
}

export const getColorBySlug = (slug: string): Color | undefined => colorsBySlug.get(slug)

export const colorSlugs = (): string[] => allColors.map((color) => color.slug)

export const combinationNumbers = (): number[] =>
  Array.from({ length: COMBINATION_COUNT }, (_, i) => i + 1)

export const getCombination = (n: number): Combination | undefined => {
  if (!Number.isInteger(n) || n < 1 || n > COMBINATION_COUNT) return undefined
  return {
    number: n,
    colors: allColors
      .filter((color) => color.combinations.includes(n))
      .map(({ hex, name, slug }) => ({ hex, name, slug })),
  }
}
