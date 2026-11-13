// Favicons: one square SVG per swatch and per combination, rendered at build
// time. The routes are named favicon.svg because Next treats any icon.svg path
// as a metadata file. The <Favicon> client component imports the paths, so
// nothing here may read the color library.

// They share the cards' cache header (next.config.ts). After an icon redesign,
// add a version query to the two paths below.
export const swatchIconPath = (slug: string) => `/swatch/${slug}/favicon.svg`
export const combinationIconPath = (n: number) => `/combination/${n}/favicon.svg`

// 60 divides evenly by every combination size (2 to 4 colors), with room for 1 to 6
const SIZE = 60

// Side-by-side bars of equal width filling the square, one per color
export const iconSvg = (hexes: string[]) => {
  const width = SIZE / hexes.length
  const bars = hexes
    .map(
      (hex, i) =>
        `<rect x="${i * width}" y="0" width="${width}" height="${SIZE}" fill="${hex}"/>`
    )
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" shape-rendering="crispEdges">${bars}</svg>`
}
