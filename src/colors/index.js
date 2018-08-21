import chroma from 'chroma-js'
import { swatches } from './swatches.json'

const cv = (input) => {
  let arr = []
  input.forEach( e => {
    const val = e / 100
    arr.push(val)
  })
  return arr
}

export default () => {
  let colorList = []
  swatches.forEach((e, i) => {
    const colorObject = {
      "index": i + 1,
      "name": e.name,
      "cmyk_array": e.cmyk,
      "cmyk": `C${e.cmyk[0]} / M${e.cmyk[1]} / Y${e.cmyk[2]} / K${e.cmyk[3]}`,
      "rgb": `${e.cmyk} :: RGB`,
      "hex": `${chroma.cmyk(cv(e.cmyk))}`,
      "combinations": e.combinations,
      "use_count": e.combinations.length
    }
    colorList.push(colorObject)
  })
  return colorList
}
