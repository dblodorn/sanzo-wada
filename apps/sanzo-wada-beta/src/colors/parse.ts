import type { CMYK, RawColor } from './types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isCmyk = (value: unknown): value is CMYK =>
  Array.isArray(value) &&
  value.length === 4 &&
  value.every((v) => typeof v === 'number' && v >= 0 && v <= 100)

// Lowercase letters and digits, joined by single hyphens
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

const isCombinationList = (value: unknown): value is readonly number[] =>
  Array.isArray(value) && value.every((v) => Number.isInteger(v))

// The swatch JSON is typed as number[] by resolveJsonModule, so check its shape
// once at load and fail the build on a malformed edit instead of casting.
export const parseRawColors = (group: string, input: unknown): RawColor[] => {
  if (!Array.isArray(input)) {
    throw new Error(`Swatch group "${group}" is not an array`)
  }
  return input.map((entry: unknown, i) => {
    const label = isRecord(entry) && typeof entry.name === 'string' ? entry.name : `#${i}`
    if (!isRecord(entry) || typeof entry.name !== 'string') {
      throw new Error(`Swatch group "${group}" entry ${label} has no name`)
    }
    if (typeof entry.slug !== 'string') {
      throw new Error(`Color "${label}" in group "${group}" has no slug`)
    }
    if (!SLUG.test(entry.slug)) {
      throw new Error(
        `Color "${label}" in group "${group}" has malformed slug "${entry.slug}" (use lowercase letters, digits and single hyphens)`
      )
    }
    if (!isCmyk(entry.cmyk)) {
      throw new Error(
        `Color "${label}" in group "${group}" needs four CMYK values between 0 and 100`
      )
    }
    if (!isCombinationList(entry.combinations)) {
      throw new Error(
        `Color "${label}" in group "${group}" has non-integer combination numbers`
      )
    }
    return {
      name: entry.name,
      slug: entry.slug,
      cmyk: entry.cmyk,
      combinations: entry.combinations,
    }
  })
}
