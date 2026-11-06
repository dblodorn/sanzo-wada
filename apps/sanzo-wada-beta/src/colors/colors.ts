import chroma from 'chroma-js'
import type { CMYK, Color, RawColor, RGB } from './types'

const cv = (input: CMYK): CMYK => [input[0] / 100, input[1] / 100, input[2] / 100, input[3] / 100]

export default (swatches: readonly RawColor[]): Color[] =>
  swatches.map((e, i) => {
    const hex = chroma.cmyk(...cv(e.cmyk))
    const rgb: RGB = chroma(hex).rgb()
    return {
      index: i + 1,
      name: e.name,
      slug: e.slug,
      cmyk_array: e.cmyk,
      cmyk: `C:${e.cmyk[0]} / M:${e.cmyk[1]} / Y:${e.cmyk[2]} / K:${e.cmyk[3]}`,
      rgb_array: rgb,
      rgb: `R:${rgb[0]} / G:${rgb[1]} / B:${rgb[2]}`,
      hex: `${hex}`,
      combinations: e.combinations,
      use_count: e.combinations.length,
    }
  })
