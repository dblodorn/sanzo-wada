import chroma from 'chroma-js'
import lowerCase from 'lodash/lowerCase'
import mixin from 'lodash/mixin'
import _ from 'lodash/wrapperLodash'

mixin(_, {
  lowerCase: lowerCase
})

const cv = (input) => {
  let arr = []
  input.forEach( e => {
    const val = e / 100
    arr.push(val)
  })
  return arr
}

const returnSlug = (title) => {
  return title.replace(/\s+/g, '-').toLowerCase()
}

export default (swatches) => {
  let colorList = []
  swatches.forEach((e, i) => {
    const hex = chroma.cmyk(cv(e.cmyk))
    const rgb = chroma(hex).rgb()
    const colorObject = {
      "index": i + 1,
      "name": e.name,
      "slug": returnSlug(e.name),
      "cmyk_array": e.cmyk,
      "cmyk": `C:${e.cmyk[0]} / M:${e.cmyk[1]} / Y:${e.cmyk[2]} / K:${e.cmyk[3]}`,
      "rgb_array": rgb,
      "rgb": `R:${rgb[0]} / G:${rgb[1]} / B:${rgb[2]}`,
      "hex": `${hex}`,
      "combinations": e.combinations,
      "use_count": e.combinations.length
    }
    colorList.push(colorObject)
  })
  return colorList
}
