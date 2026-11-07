import { allColors, normalizeName } from '@/colors'

const levenshtein = (a: string, b: string): number => {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
    previous = current
  }
  return previous[b.length]
}

// Up to three slugs whose names are closest to an unknown slug. A name that
// contains the input ranks first, then edit distance, then book order.
export const suggestSlugs = (input: string, count = 3): string[] => {
  const needle = normalizeName(input)
  if (!needle) return []
  return allColors
    .map((color) => {
      const name = normalizeName(color.name)
      return {
        slug: color.slug,
        contains: name.includes(needle) ? 0 : 1,
        distance: levenshtein(needle, name),
        index: color.index,
      }
    })
    .sort(
      (a, b) => a.contains - b.contains || a.distance - b.distance || a.index - b.index
    )
    .slice(0, count)
    .map((entry) => entry.slug)
}
