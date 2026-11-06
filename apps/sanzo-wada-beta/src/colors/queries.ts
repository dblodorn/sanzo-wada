import chroma from 'chroma-js'
import { allColors, getColorBySlug, getCombination, combinationNumbers, groupOf } from '.'
import type { Color, Combination, GroupId, NearestColor } from './types'

// Compare names the way slugs are written: no apostrophes, punctuation as spaces
export const normalizeName = (text: string): string =>
  text
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

export const searchColors = (text = '', group?: GroupId): Color[] => {
  const needle = normalizeName(text)
  return allColors.filter(
    (color) =>
      (group === undefined || groupOf(color.slug) === group) &&
      normalizeName(color.name).includes(needle)
  )
}

export type CombinationsWithResult =
  | { readonly combinations: Combination[] }
  | { readonly unknownSlug: string }

export const combinationsWith = (
  slugs: readonly string[],
  size?: number
): CombinationsWithResult => {
  const colors: Color[] = []
  for (const slug of slugs) {
    const color = getColorBySlug(slug)
    if (!color) return { unknownSlug: slug }
    colors.push(color)
  }
  const combinations = combinationNumbers()
    .filter((n) => colors.every((color) => color.combinations.includes(n)))
    .map((n) => getCombination(n) as Combination)
    .filter((combination) => size === undefined || combination.colors.length === size)
  return { combinations }
}

// #rgb, rgb, #rrggbb or rrggbb in any case, returned as #rrggbb
export const normalizeHex = (input: string): string | undefined => {
  const match = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(input.trim())
  if (!match) return undefined
  const digits = match[1].toLowerCase()
  return `#${digits.length === 3 ? [...digits].map((d) => d + d).join('') : digits}`
}

export const NEAREST_MAX = 20

// Built on first use: the module is imported by index.ts before allColors exists
let swatches: { color: Color; value: chroma.Color }[] | undefined

export const nearestColors = (hex: string, limit = 5): NearestColor[] | undefined => {
  const normalized = normalizeHex(hex)
  if (!normalized) return undefined
  if (!Number.isInteger(limit) || limit < 1 || limit > NEAREST_MAX) {
    throw new RangeError(`limit must be an integer from 1 to ${NEAREST_MAX}`)
  }
  swatches ??= allColors.map((color) => ({ color, value: chroma(color.hex) }))
  const target = chroma(normalized)
  return swatches
    .map(({ color, value }) => ({
      color,
      distance: Math.round(chroma.deltaE(target, value) * 100) / 100,
    }))
    .sort((a, b) => a.distance - b.distance || a.color.index - b.color.index)
    .slice(0, limit)
}
