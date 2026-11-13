// Requests every page URL, the API docs page, the legacy slug redirects, the JSON
// API, every share card with each page's share metadata, every favicon with
// each page's icon link, and the 404 cases.
// Run against a server: pnpm --filter sanzo-wada-beta verify:routes [base-url]
// (defaults to http://localhost:3000, e.g. after `pnpm build && pnpm start`)
import { isDeepStrictEqual } from 'node:util'
import { inflateSync } from 'node:zlib'
import {
  allColors,
  colorSlugs,
  combinationNumbers,
  getCombination,
  legacySlugs,
} from '../src/colors'
import { CARD_SIZE, combinationCardPath, swatchCardPath } from '../src/cards/card'
import { combinationIconPath, swatchIconPath } from '../src/icons/icon'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')

const ok = [
  '/',
  '/about',
  '/api',
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
  '/swatch/not-a-color/favicon.svg',
  "/swatch/hay's-russet/favicon.svg",
  '/combination/0/favicon.svg',
  '/combination/349/favicon.svg',
]

// Each page with its share card and favicon, for swatches the card's
// background, and the icon's colors from left to right
const shared = [
  ...allColors.map((color) => ({
    page: `/swatch/${color.slug}`,
    card: swatchCardPath(color.slug),
    hex: color.hex as string | undefined,
    icon: swatchIconPath(color.slug),
    hexes: [color.hex as string],
  })),
  ...combinationNumbers().map((n) => ({
    page: `/combination/${n}`,
    card: combinationCardPath(n),
    hex: undefined,
    icon: combinationIconPath(n),
    hexes: getCombination(n)!.colors.map((color) => color.hex as string),
  })),
]
// Pages that pick a random icon after load; their HTML links the first color's
const randomIconPages = ['/', '/about', '/api']
const FALLBACK_ICON = swatchIconPath(colorSlugs()[0])
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

const iconLinks = (html: string) =>
  [...html.matchAll(/<link rel="icon"[^>]*href="([^"]*)"/g)].map((m) => m[1])

// A favicon's problems: equal full-height bars covering a square viewBox,
// filled with the expected colors from left to right
const iconProblems = (svg: string, hexes: string[]) => {
  const size = Number(svg.match(/viewBox="0 0 (\d+) \1"/)?.[1])
  if (!size) return 'no square viewBox'
  const bars = [...svg.matchAll(/<rect ([^>]*)\/>/g)].map(([, attrs]) =>
    Object.fromEntries([...attrs.matchAll(/(\w+)="([^"]*)"/g)].map(([, k, v]) => [k, v]))
  )
  const fills = bars.map((bar) => bar.fill)
  if (!isDeepStrictEqual(fills, hexes))
    return `fills ${fills.join(' ')}, expected ${hexes.join(' ')}`
  const width = size / hexes.length
  const covers = bars.every(
    (bar, i) =>
      Number(bar.x) === i * width &&
      Number(bar.y) === 0 &&
      Number(bar.width) === width &&
      Number(bar.height) === size
  )
  return covers ? undefined : 'bars are not equal and do not cover the viewBox'
}

const checkIcons = async () => {
  for (let i = 0; i < shared.length; i += 20) {
    const batch = shared.slice(i, i + 20)
    await Promise.all(
      batch.map(async ({ icon, hexes }) => {
        const res = await request(icon)
        const type = res.headers.get('content-type')
        if (res.status !== 200 || type !== 'image/svg+xml')
          return failures.push(`${icon}: expected an SVG, got ${res.status} ${type}`)
        const problem = iconProblems(await res.text(), hexes)
        if (problem) failures.push(`${icon}: ${problem}`)
      })
    )
  }
  for (const page of randomIconPages) {
    const links = iconLinks(await (await request(page)).text())
    if (!isDeepStrictEqual(links, [FALLBACK_ICON]))
      failures.push(
        `${page}: icon links ${links.join(' ') || 'none'}, expected ${FALLBACK_ICON}`
      )
  }
}

const checkShareCards = async () => {
  for (let i = 0; i < shared.length; i += 20) {
    const batch = shared.slice(i, i + 20)
    await Promise.all(
      batch.map(async ({ page, card, hex, icon }) => {
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
        const links = iconLinks(html)
        if (!isDeepStrictEqual(links, [icon]))
          failures.push(
            `${page}: icon links ${links.join(' ') || 'none'}, expected ${icon}`
          )
      })
    )
  }
}

// The API documentation page is HTML with the site's title
const checkApiPage = async () => {
  const res = await request('/api')
  if (!res.headers.get('content-type')?.startsWith('text/html'))
    failures.push(`/api: content type ${res.headers.get('content-type')}`)
  const html = await res.text()
  if (!html.includes(`<title>${TITLE}</title>`)) failures.push('/api: wrong <title>')
}

const main = async () => {
  await check(ok, 200)
  await checkApiPage()
  await check(notFound, 404)
  await checkRedirects()
  await checkJson()
  await checkShareCards()
  await checkIcons()

  if (failures.length) {
    console.error(failures.join('\n'))
    process.exit(1)
  }
  console.log(
    `OK: ${ok.length} page URLs (including /api) return 200, ${redirects.length} legacy URLs redirect, /assets/colors.json has ${allColors.length} colors, ${shared.length} share cards are ${CARD_SIZE.width}×${CARD_SIZE.height} PNGs that their pages point to, ${shared.length} favicons match their colors and pages, ${randomIconPages.length} other pages link the fallback icon, ${notFound.length} unknown URLs return 404 (${base})`
  )
}

main()
