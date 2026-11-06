// Compares beta's color library with alpha's runtime color lists.
// Run: pnpm --filter sanzo-wada-beta verify:colors
import { isDeepStrictEqual } from 'node:util'
import * as beta from '../src/colors'
// @ts-expect-error alpha is untyped JS
import * as alpha from '../../sanzo-wada-alpha/src/colors/swatches.js'

type AlphaColor = Record<string, unknown> & { combinations: number[]; hex: string; name: string; slug: string }

// The one intended data difference (design.md, Decision 5)
const ALLOWED: Record<string, readonly string[]> = {
  'dull-violet-black': ['cmyk', 'cmyk_array'],
}

const alphaGroups = alpha.swatchArray as { swatches: AlphaColor[] }[]
const alphaAll = alpha.swatchArrayAll as AlphaColor[]
const errors: string[] = []
const allowedSeen = new Set<string>()

const compareColor = (where: string, a: AlphaColor, b: beta.Color) => {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const key of keys) {
    const av = a[key]
    const bv = (b as unknown as Record<string, unknown>)[key]
    if (isDeepStrictEqual(av, bv)) continue
    if (ALLOWED[b.slug]?.includes(key)) {
      allowedSeen.add(`${where} ${b.slug}.${key}: ${JSON.stringify(av)} → ${JSON.stringify(bv)}`)
      continue
    }
    errors.push(`${where} ${b.slug}.${key}: alpha ${JSON.stringify(av)} beta ${JSON.stringify(bv)}`)
  }
}

if (alphaGroups.length !== beta.swatchGroups.length) errors.push('group count differs')
alphaGroups.forEach((group, g) => {
  const betaGroup = beta.swatchGroups[g]?.swatches ?? []
  if (group.swatches.length !== betaGroup.length) errors.push(`group ${g + 1} size differs`)
  group.swatches.forEach((color, i) => compareColor(`group ${g + 1}`, color, betaGroup[i]))
})

if (alphaAll.length !== beta.allColors.length) errors.push('flat list size differs')
alphaAll.forEach((color, i) => compareColor('flat', color, beta.allColors[i]))

for (let n = 1; n <= beta.COMBINATION_COUNT; n++) {
  // alpha's comboData filter
  const expected = alphaAll
    .filter((e) => e.combinations.includes(n))
    .map((e) => ({ hex: e.hex, name: e.name, slug: e.slug }))
  const actual = beta.getCombination(n)?.colors
  if (!isDeepStrictEqual(expected, actual)) errors.push(`combination ${n} differs`)
}

allowedSeen.forEach((line) => console.log(`allowed: ${line}`))
if (errors.length) {
  console.error(errors.join('\n'))
  console.error(`\n${errors.length} unexpected difference(s)`)
  process.exit(1)
}
console.log(
  `OK: ${beta.allColors.length} colors in ${beta.swatchGroups.length} groups and ${beta.COMBINATION_COUNT} combinations match alpha`
)
