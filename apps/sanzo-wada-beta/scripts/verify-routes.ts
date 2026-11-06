// Requests every page URL alpha serves and checks the 404 cases.
// Run against a server: pnpm --filter sanzo-wada-beta verify:routes [base-url]
// (defaults to http://localhost:3000, e.g. after `pnpm build && pnpm start`)
import { colorSlugs, combinationNumbers } from '../src/colors'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')

// encodeURI leaves | and ' alone, so also request the fully percent-encoded form
const literal = (slug: string) => `/swatch/${slug}`
const encoded = (slug: string) =>
  `/swatch/${encodeURIComponent(slug).replace(/'/g, '%27')}`

const punctuated = colorSlugs().filter((slug) => /[^a-z0-9-]/.test(slug))
const ok = [
  '/',
  '/about',
  ...colorSlugs().map(literal),
  ...combinationNumbers().map((n) => `/combination/${n}`),
]
const okExtra = punctuated.map(encoded)
const notFound = ['/swatch/not-a-color', '/combination/0', '/combination/349', '/combination/abc']

const status = async (path: string) => {
  // fetch would normalise some characters; build the URL by hand
  const res = await fetch(base + path.replace(/\|/g, '%7C'), { redirect: 'manual' })
  return res.status
}

const failures: string[] = []
const check = async (paths: string[], expected: number) => {
  for (let i = 0; i < paths.length; i += 20) {
    const batch = paths.slice(i, i + 20)
    const results = await Promise.all(batch.map(status))
    results.forEach((s, j) => {
      if (s !== expected) failures.push(`${batch[j]}: expected ${expected}, got ${s}`)
    })
  }
}

const main = async () => {
  await check(ok, 200)
  await check(okExtra, 200)
  await check(notFound, 404)

  if (failures.length) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
  console.log(
    `OK: ${ok.length} page URLs + ${okExtra.length} percent-encoded slugs return 200, ${notFound.length} unknown URLs return 404 (${base})`
  )
}

main()
