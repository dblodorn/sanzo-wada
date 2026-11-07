// Requests every page URL, the legacy slug redirects, the JSON API, every share
// card with each page's share metadata, and the 404 cases.
// Run against a server: pnpm --filter sanzo-wada-beta verify:routes [base-url]
// (defaults to http://localhost:3000, e.g. after `pnpm build && pnpm start`)
import { isDeepStrictEqual } from 'node:util'
import { inflateSync } from 'node:zlib'
import { allColors, colorSlugs, combinationNumbers, legacySlugs } from '../src/colors'
import { CARD_SIZE, combinationCardPath, swatchCardPath } from '../src/cards/card'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')

const ok = [
  '/',
  '/about',
  ...colorSlugs().map((slug) => `/swatch/${slug}`),
  ...combinationNumbers().map((n) => `/combination/${n}`),
]
const notFound = [
  '/swatch/not-a-color',
  '/combination/0',
  '/combination/349',
  '/combination/abc',
  '/swatch/not-a-color/card.png',
  "/swatch/hay's-russet/card.png",
  '/combination/0/card.png',
  '/combination/349/card.png',
]

// Each page with its share card, and for swatches the card's background
const shared = [
  ...allColors.map((color) => ({
    page: `/swatch/${color.slug}`,
    card: swatchCardPath(color.slug),
    hex: color.hex as string | undefined,
  })),
  ...combinationNumbers().map((n) => ({
    page: `/combination/${n}`,
    card: combinationCardPath(n),
    hex: undefined,
  })),
]
const TITLE = 'WADA SANZO | DICTIONARY OF COLOR COMBINATIONS'

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
    failures.push(
      `/assets/colors.json: status ${res.status}, does not match the color library`
    )
}

// A PNG's size from its IHDR chunk, and the colour of its top-right pixel from
// the first scanline (the first row's filters need no previous row)
const readPng = (png: Buffer) => {
  if (png.toString('latin1', 1, 4) !== 'PNG') return undefined
  const width = png.readUInt32BE(16)
  const height = png.readUInt32BE(20)
  const [depth, colorType] = [png[24], png[25]]
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0
  if (depth !== 8 || !channels) return { width, height, topRight: undefined }
  const idat: Buffer[] = []
  for (let at = 8; at < png.length; ) {
    const length = png.readUInt32BE(at)
    if (png.toString('latin1', at + 4, at + 8) === 'IDAT')
      idat.push(png.subarray(at + 8, at + 8 + length))
    at += length + 12
  }
  const raw = inflateSync(Buffer.concat(idat))
  const stride = width * channels
  const row = Buffer.from(raw.subarray(1, 1 + stride))
  const filter = raw[0]
  for (let i = 0; i < stride; i++) {
    const left = i >= channels ? row[i - channels] : 0
    // Up adds the previous row (zero); Average adds half of left; Paeth picks left
    if (filter === 1 || filter === 4) row[i] = (row[i] + left) & 0xff
    if (filter === 3) row[i] = (row[i] + (left >> 1)) & 0xff
  }
  const px = row.subarray(stride - channels, stride - channels + 3)
  const topRight = '#' + [...px].map((v) => v.toString(16).padStart(2, '0')).join('')
  return { width, height, topRight }
}

const meta = (html: string, key: string) =>
  html.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`))?.[1]

const checkShareCards = async () => {
  for (let i = 0; i < shared.length; i += 20) {
    const batch = shared.slice(i, i + 20)
    await Promise.all(
      batch.map(async ({ page, card, hex }) => {
        const res = await request(card)
        const type = res.headers.get('content-type')
        if (res.status !== 200 || type !== 'image/png')
          return failures.push(`${card}: expected a PNG, got ${res.status} ${type}`)
        const png = readPng(Buffer.from(await res.arrayBuffer()))
        if (png?.width !== CARD_SIZE.width || png.height !== CARD_SIZE.height)
          failures.push(`${card}: size ${png?.width}×${png?.height}`)
        if (hex && png?.topRight !== hex)
          failures.push(`${card}: top-right pixel ${png?.topRight}, expected ${hex}`)

        const html = await (await request(page)).text()
        if (meta(html, 'og:image') !== base + card)
          failures.push(`${page}: og:image is ${meta(html, 'og:image')}`)
        if (meta(html, 'twitter:card') !== 'summary_large_image')
          failures.push(`${page}: twitter:card is ${meta(html, 'twitter:card')}`)
        if (!html.includes(`<title>${TITLE}</title>`))
          failures.push(`${page}: title changed`)
      })
    )
  }
}

const main = async () => {
  await check(ok, 200)
  await check(notFound, 404)
  await checkRedirects()
  await checkJson()
  await checkShareCards()

  if (failures.length) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
  console.log(
    `OK: ${ok.length} page URLs return 200, ${redirects.length} legacy URLs redirect, /assets/colors.json has ${allColors.length} colors, ${shared.length} share cards are ${CARD_SIZE.width}×${CARD_SIZE.height} PNGs that their pages point to, ${notFound.length} unknown URLs return 404 (${base})`
  )
}

main()
