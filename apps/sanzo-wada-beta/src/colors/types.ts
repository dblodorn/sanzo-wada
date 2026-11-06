// CMYK values are 0–100, as printed in the book
export type CMYK = readonly [c: number, m: number, y: number, k: number]
export type RGB = readonly [r: number, g: number, b: number]

// A color as it appears in swatches_{a..f}.json
export interface RawColor {
  readonly name: string
  readonly cmyk: CMYK
  readonly combinations: readonly number[]
}

// A color enriched at build time (field names match the alpha app)
export interface Color {
  readonly index: number
  readonly name: string
  readonly slug: string
  readonly cmyk_array: CMYK
  readonly cmyk: string
  readonly rgb_array: RGB
  readonly rgb: string
  readonly hex: string
  readonly combinations: readonly number[]
  readonly use_count: number
}

export interface SwatchGroup {
  readonly swatches: readonly Color[]
}

export type CombinationColor = Pick<Color, 'hex' | 'name' | 'slug'>

export interface Combination {
  readonly number: number
  readonly colors: readonly CombinationColor[]
}
