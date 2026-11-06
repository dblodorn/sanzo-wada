// Requests every page URL, the legacy slug redirects, the JSON API and the 404 cases.
// Run against a server: pnpm --filter sanzo-wada-beta verify:routes [base-url]
// (defaults to http://localhost:3000, e.g. after `pnpm build && pnpm start`)
import { isDeepStrictEqual } from 'node:util'
import { allColors, colorSlugs, combinationNumbers, legacySlugs } from '../src/colors'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')

const ok = [
  '/',
  '/about',
  ...colorSlugs().map((slug) => `/swatch/${slug}`),
  ...combinationNumbers().map((n) => `/combination/${n}`),
]
const notFound = ['/swatch/not-a-color', '/combination/0', '/combination/349', '/combination/abc']

// Alpha's punctuated slugs, as typed and percent-encoded, each with its target
const redirects = Object.entries(legacySlugs).flatMap(([legacy, slug]) => {
  const encoded = encodeURIComponent(legacy).replace(/'/g, '%27')
  return [legacy, encoded].map((spelling) => [`/swatch/${spelling}`, `/swatch/${slug}`])
})

const request = (path: string) =>
  // fetch would normalise some characters; build the URL by hand
  fetch(base + path.replace(/\|/g, '%7C'), { redirect: 'manual' })

const failures: string[] = []
const check = async (paths: string[], expected: number) => {
  for (let i = 0; i < paths.length; i += 20) {
    const batch = paths.slice(i, i + 20)
    const results = await Promise.all(batch.map(request))
    results.forEach((res, j) => {
      if (res.status !== expected)
        failures.push(`${batch[j]}: expected ${expected}, got ${res.status}`)
    })
  }
}

const checkRedirects = async () => {
  for (const [from, to] of redirects) {
    const res = await request(from)
    const location = res.headers.get('location') ?? ''
    if (res.status !== 308 || new URL(location, base).pathname !== to)
      failures.push(`${from}: expected 308 to ${to}, got ${res.status} ${location}`)
  }
}

const checkJson = async () => {
  const res = await request('/assets/colors.json')
  const body = res.ok ? await res.json() : undefined
  if (!isDeepStrictEqual(body, { colors: JSON.parse(JSON.stringify(allColors)) }))
    failures.push(`/assets/colors.json: status ${res.status}, does not match the color library`)
}

const main = async () => {
  await check(ok, 200)
  await check(notFound, 404)
  await checkRedirects()
  await checkJson()

  if (failures.length) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
  console.log(
    `OK: ${ok.length} page URLs return 200, ${redirects.length} legacy URLs redirect, /assets/colors.json has ${allColors.length} colors, ${notFound.length} unknown URLs return 404 (${base})`
  )
}

main()
