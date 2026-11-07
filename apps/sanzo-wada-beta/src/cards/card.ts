import type { Color, Combination } from '@/colors'

// Share cards: one 1200 × 630 PNG per swatch and per combination, rendered at
// build time. Pages, metadata and API resources all build card URLs here.

export const CARD_SIZE = { width: 1200, height: 630 } as const

// Cards only change on deploy, so everyone may keep them for a year. After a
// card redesign, bust caches by adding a version query to the two paths below.
export const CARD_CACHE = 'public, max-age=31536000, immutable'

export const CREDIT = 'Wada Sanzo — A Dictionary of Color Combinations'

export const swatchCardPath = (slug: string) => `/swatch/${slug}/card.png`
export const combinationCardPath = (n: number) => `/combination/${n}/card.png`

const colorList = (combination: Combination) =>
  combination.colors.map((color) => `${color.name} ${color.hex}`).join(', ')

export const swatchTitle = (color: Color) => `${color.name} | Wada Sanzo`
export const combinationTitle = (combination: Combination) =>
  `Combination ${combination.number} | Wada Sanzo`

export const swatchAlt = (color: Color) => `${color.name}, ${color.hex}`
export const combinationAlt = (combination: Combination) =>
  `Combination ${combination.number}: ${colorList(combination)}`

export const swatchDescription = (color: Color) =>
  `${color.name} (${color.hex}) appears in ${color.combinations.length} ${color.combinations.length === 1 ? 'combination' : 'combinations'} in Wada Sanzo's A Dictionary of Color Combinations.`
export const combinationDescription = (combination: Combination) =>
  `A combination of ${combination.colors.length} colors from Wada Sanzo's A Dictionary of Color Combinations: ${colorList(combination)}.`
