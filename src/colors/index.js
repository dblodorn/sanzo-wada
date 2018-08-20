import { swatches } from './swatches.json'

export default () => {
  let colorList = []
  swatches.forEach((e, i) => {
    const colorObject = {
      "index": i + 1,
      "name": e.name,
      "cmyk": `${e.cmyk} :: CMYK`,
      "rgb": `${e.cmyk} :: RGB`,
      "hex": `${e.cmyk} :: HEX`,
      "combinations": e.combinations,
      "use_count": e.combinations.length
    }
    colorList.push(colorObject)
  })
  return colorList
}
