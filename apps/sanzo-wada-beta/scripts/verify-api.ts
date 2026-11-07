// Checks the REST API, /llms.txt and the MCP server against the specs.
// Run against a server: pnpm --filter sanzo-wada-beta verify:api [base-url]
// (defaults to http://localhost:3000, e.g. after `pnpm build && pnpm start`)
import { isDeepStrictEqual } from 'node:util'
import { validate } from '@readme/openapi-parser'
import { z } from 'zod'
import {
  colorDetailSchema,
  colorSchema,
  combinationSchema,
  errorSchema,
  groupSchema,
  list,
  nearestColorSchema,
  single,
} from '../src/api/schemas'

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const failures: string[] = []
const fail = (where: string, message: string) => failures.push(`${where}: ${message}`)
let checks = 0

const request = (path: string, init: RequestInit = {}) =>
  fetch(base + path, {
    ...init,
    redirect: 'manual',
    headers: { Origin: 'https://example.com', ...init.headers },
  })

// Status, JSON content type, CORS, caching and body shape of one response
const expectJson = async <T extends z.ZodType>(
  path: string,
  status: number,
  schema: T,
  init?: RequestInit
): Promise<z.output<T> | undefined> => {
  checks++
  const res = await request(path, init)
  const where = `${init?.method ?? 'GET'} ${path}`
  if (res.status !== status) fail(where, `expected ${status}, got ${res.status}`)
  if (!res.headers.get('content-type')?.startsWith('application/json'))
    fail(where, `content type ${res.headers.get('content-type')}`)
  if (res.headers.get('access-control-allow-origin') !== '*')
    fail(where, 'no CORS header')
  // Vercel's CDN consumes s-maxage and passes on only max-age, so behind it a
  // CDN-cached success shows as max-age=300 plus an x-vercel-cache header
  const cache = res.headers.get('cache-control') ?? ''
  const cdnCached =
    cache.includes('s-maxage') ||
    (res.headers.has('x-vercel-cache') && cache === 'public, max-age=300')
  if (status === 200 ? !cdnCached : !cache.startsWith('public'))
    fail(where, `cache-control "${cache}"`)
  const parsed = schema.safeParse(await res.json().catch(() => undefined))
  if (!parsed.success) {
    fail(where, `body does not match schema: ${parsed.error.issues[0]?.message}`)
    return undefined
  }
  return parsed.data
}

const expectError = async (path: string, status: number, code: string, mentions = '') => {
  const body = await expectJson(path, status, errorSchema)
  if (body && body.error.code !== code)
    fail(path, `error code ${body.error.code}, expected ${code}`)
  if (body && !body.error.message.includes(mentions))
    fail(path, `error message "${body.error.message}" does not mention "${mentions}"`)
}

const numbers = (combinations: readonly { number: number }[] | undefined) =>
  combinations?.map((combination) => combination.number)

const checkRest = async () => {
  const colors = await expectJson('/api/v1/colors', 200, list(colorSchema))
  if (colors?.count !== 159) fail('/api/v1/colors', `count ${colors?.count}`)

  // The color list is the public JSON plus group and links
  const res = await fetch(`${base}/assets/colors.json`)
  const publicJson = (await res.json()) as { colors: Record<string, unknown>[] }
  colors?.data.forEach(
    ({ group: _group, url: _url, api_url: _api, card_url: _card, ...color }, i) => {
      if (!isDeepStrictEqual(color, publicJson.colors[i]))
        fail('/api/v1/colors', `entry ${i} differs from /assets/colors.json`)
    }
  )

  const search = await expectJson(
    '/api/v1/colors?q=hays%20russet',
    200,
    list(colorSchema)
  )
  if (!search?.data.some((color) => color.name === "Hay's Russet"))
    fail('?q=hays russet', "Hay's Russet missing")
  const red = await expectJson('/api/v1/colors?q=RED', 200, list(colorSchema))
  if (red?.count !== 19) fail('?q=RED', `count ${red?.count}`)
  const groupF = await expectJson('/api/v1/colors?group=f', 200, list(colorSchema))
  if (groupF?.count !== 6 || groupF.data.some((color) => color.group !== 'f'))
    fail('?group=f', 'expected six colors in group f')
  await expectError('/api/v1/colors?group=z', 400, 'invalid_parameter', 'group')

  const hermosa = await expectJson(
    '/api/v1/colors/hermosa-pink',
    200,
    single(colorDetailSchema)
  )
  if (
    hermosa?.data.hex !== '#ffb3f0' ||
    !isDeepStrictEqual(numbers(hermosa.data.combination_details), [176, 227, 273])
  )
    fail('/api/v1/colors/hermosa-pink', 'expected #ffb3f0 in 176, 227 and 273')
  for (const path of ["/api/v1/colors/hay's-russet", '/api/v1/colors/hay%27s-russet']) {
    const legacy = await expectJson(path, 200, single(colorDetailSchema))
    if (legacy?.data.slug !== 'hays-russet') fail(path, `slug ${legacy?.data.slug}`)
  }
  await expectError('/api/v1/colors/not-a-color', 404, 'not_found')

  const combinations = await expectJson(
    '/api/v1/combinations',
    200,
    list(combinationSchema)
  )
  const sizes = [2, 3, 4].map(
    (size) => combinations?.data.filter((c) => c.size === size).length
  )
  if (combinations?.count !== 348 || !isDeepStrictEqual(sizes, [120, 120, 108]))
    fail('/api/v1/combinations', `count ${combinations?.count}, sizes ${sizes}`)
  const withPink = await expectJson(
    '/api/v1/combinations?colors=hermosa-pink',
    200,
    list(combinationSchema)
  )
  if (!isDeepStrictEqual(numbers(withPink?.data), [176, 227, 273]))
    fail('?colors=hermosa-pink', `got ${numbers(withPink?.data)}`)
  const pairs = await expectJson(
    '/api/v1/combinations?size=2',
    200,
    list(combinationSchema)
  )
  if (pairs?.count !== 120) fail('?size=2', `count ${pairs?.count}`)
  const one = await expectJson('/api/v1/combinations/1', 200, single(combinationSchema))
  const oneColors = one?.data.colors.map((color) => `${color.name} ${color.hex}`)
  if (!isDeepStrictEqual(oneColors, ['English Red #de4500', 'Cerulian Blue #29bdad']))
    fail('/api/v1/combinations/1', `colors ${oneColors}`)
  for (const n of ['0', '349', 'abc', '1.5'])
    await expectError(`/api/v1/combinations/${n}`, 404, 'not_found')
  await expectError(
    '/api/v1/combinations?colors=hermosa-pink,not-a-color',
    400,
    'invalid_parameter',
    'not-a-color'
  )
  await expectError(
    '/api/v1/combinations?colors=a,b,c,d,e',
    400,
    'invalid_parameter',
    'colors'
  )
  await expectError('/api/v1/combinations?size=5', 400, 'invalid_parameter', 'size')

  const groups = await expectJson('/api/v1/groups', 200, list(groupSchema))
  if (
    !isDeepStrictEqual(
      groups?.data.map((group) => group.count),
      [38, 49, 23, 23, 20, 6]
    )
  )
    fail('/api/v1/groups', 'unexpected group counts')

  const nearest = await expectJson(
    '/api/v1/nearest?hex=ffb3f0&limit=3',
    200,
    list(nearestColorSchema)
  )
  if (
    nearest?.count !== 3 ||
    nearest.data[0].slug !== 'hermosa-pink' ||
    nearest.data[0].distance !== 0
  )
    fail('/api/v1/nearest?hex=ffb3f0', 'expected Hermosa Pink at distance 0 first')
  const forms = await Promise.all(
    ['FFF', '%23fff', '%23FFFFFF'].map((hex) =>
      expectJson(`/api/v1/nearest?hex=${hex}`, 200, list(nearestColorSchema))
    )
  )
  if (!forms.every((form) => isDeepStrictEqual(form, forms[0])))
    fail('/api/v1/nearest', 'hex forms differ')
  await expectError('/api/v1/nearest', 400, 'invalid_parameter', 'hex')
  await expectError('/api/v1/nearest?hex=blue', 400, 'invalid_parameter', 'hex')
  await expectError('/api/v1/nearest?hex=fff&limit=21', 400, 'invalid_parameter', 'limit')

  await expectError('/api/v1/palettes', 404, 'not_found')
  await expectJson('/api/v1/colors', 405, errorSchema, { method: 'POST' })
  await expectJson('/api/v1/combinations/1', 405, errorSchema, { method: 'DELETE' })

  checks++
  const preflight = await request('/api/v1/colors', { method: 'OPTIONS' })
  if (
    preflight.status !== 204 ||
    preflight.headers.get('access-control-allow-origin') !== '*'
  )
    fail('OPTIONS /api/v1/colors', `status ${preflight.status}`)
  checks++
  const head = await request('/api/v1/groups', { method: 'HEAD' })
  if (head.status !== 200) fail('HEAD /api/v1/groups', `status ${head.status}`)

  return { colors: colors?.data ?? [], combinations: combinations?.data ?? [] }
}

// Every color's page and API links, and a sample of combinations'. Card links
// must name the right card; a sample of them must serve a PNG.
type Linked = { url: string; api_url: string; card_url: string }
const checkLinks = async (
  colors: (Linked & { slug: string })[],
  combinations: (Linked & { number: number; colors: (Linked & { slug: string })[] })[]
) => {
  const cardUrls = [
    ...colors.map((color) => [color.card_url, `/swatch/${color.slug}/card.png`]),
    ...combinations.flatMap((c) => [
      [c.card_url, `/combination/${c.number}/card.png`],
      ...c.colors.map((color) => [color.card_url, `/swatch/${color.slug}/card.png`]),
    ]),
  ]
  for (const [actual, path] of cardUrls) {
    checks++
    if (actual !== base + path) fail(path, `card_url is ${actual}`)
  }

  const sampled = <T extends Linked>(items: T[]) => items.filter((_, i) => i % 25 === 0)
  const urls = [
    ...colors.flatMap((color) => [color.url, color.api_url]),
    ...sampled(combinations).flatMap((c) => [c.url, c.api_url]),
  ]
  const cards = [...sampled(colors), ...sampled(combinations)].map(
    (item) => item.card_url
  )
  const all = [...urls, ...cards]
  for (let i = 0; i < all.length; i += 20) {
    const batch = all.slice(i, i + 20)
    const results = await Promise.all(
      batch.map((url) => fetch(url, { redirect: 'manual' }))
    )
    results.forEach((res, j) => {
      checks++
      if (!batch[j].startsWith(base)) fail(batch[j], `link does not use ${base}`)
      if (res.status !== 200) fail(batch[j], `link returns ${res.status}`)
      if (cards.includes(batch[j]) && res.headers.get('content-type') !== 'image/png')
        fail(batch[j], `card is ${res.headers.get('content-type')}`)
    })
  }
  return all.length
}

const checkDocs = async () => {
  checks++
  const document = await (await request('/api/v1/openapi.json')).json()
  try {
    await validate(structuredClone(document))
  } catch (error) {
    fail('/api/v1/openapi.json', `invalid OpenAPI: ${(error as Error).message}`)
  }
  if (document.openapi !== '3.1.0')
    fail('/api/v1/openapi.json', `version ${document.openapi}`)
  for (const path of [
    '/api/v1/colors',
    '/api/v1/colors/{slug}',
    '/api/v1/combinations',
    '/api/v1/combinations/{n}',
    '/api/v1/groups',
    '/api/v1/nearest',
  ])
    if (!document.paths?.[path]) fail('/api/v1/openapi.json', `missing ${path}`)

  checks++
  const res = await request('/llms.txt')
  const text = await res.text()
  if (!res.headers.get('content-type')?.startsWith('text/plain'))
    fail('/llms.txt', 'not text/plain')
  for (const url of [
    `${base}/api/v1/openapi.json`,
    `${base}/api/mcp`,
    `${base}/swatch/hermosa-pink/card.png`,
    `${base}/combination/1/card.png`,
  ])
    if (!text.includes(url)) fail('/llms.txt', `missing ${url}`)
}

// A minimal MCP client over raw fetch: JSON-RPC in, JSON or SSE out
type RpcResponse = {
  result?: Record<string, any>
  error?: { code: number; message: string }
}
let rpcId = 0
const rpc = async (
  method: string,
  params: Record<string, unknown> = {}
): Promise<RpcResponse> => {
  checks++
  const res = await fetch(`${base}/api/mcp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-06-18',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++rpcId, method, params }),
  })
  const body = await res.text()
  const json = res.headers.get('content-type')?.includes('text/event-stream')
    ? body
        .split('\n')
        .find((line) => line.startsWith('data: '))
        ?.slice(6)
    : body
  if (res.status !== 200 || !json) {
    fail(`MCP ${method}`, `status ${res.status}`)
    return {}
  }
  return JSON.parse(json)
}

const restData = async (path: string) =>
  ((await (await request(path)).json()) as { data: unknown }).data

const checkMcp = async () => {
  const init = await rpc('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'verify-api', version: '1.0.0' },
  })
  if (init.result?.serverInfo?.name !== 'sanzo-wada')
    fail('MCP initialize', 'server name is not sanzo-wada')
  if (!init.result?.capabilities?.tools || !init.result?.capabilities?.resources)
    fail('MCP initialize', 'missing tools or resources capability')
  if (!init.result?.instructions) fail('MCP initialize', 'no instructions')

  const tools: {
    name: string
    outputSchema?: unknown
    inputSchema?: unknown
    annotations?: Record<string, boolean>
  }[] = (await rpc('tools/list')).result?.tools ?? []
  const names = tools.map((tool) => tool.name).sort()
  if (
    !isDeepStrictEqual(names, [
      'find_combinations',
      'get_color',
      'get_combination',
      'nearest_colors',
      'search_colors',
    ])
  )
    fail('MCP tools/list', `tools ${names}`)
  for (const tool of tools) {
    const a = tool.annotations ?? {}
    if (
      !tool.inputSchema ||
      !tool.outputSchema ||
      !a.readOnlyHint ||
      !a.idempotentHint ||
      a.openWorldHint !== false
    )
      fail(`MCP ${tool.name}`, 'missing schema or read-only annotations')
  }

  const call = async (name: string, args: Record<string, unknown>) =>
    (await rpc('tools/call', { name, arguments: args })).result ?? {}
  const text = (result: Record<string, any>): string => result.content?.[0]?.text ?? ''

  // Each tool returns exactly what the matching REST request returns
  const pairs: [string, Record<string, unknown>, string][] = [
    ['search_colors', {}, '/api/v1/colors'],
    ['search_colors', { query: 'red', group: 'a' }, '/api/v1/colors?q=red&group=a'],
    ['get_color', { slug: 'hermosa-pink' }, '/api/v1/colors/hermosa-pink'],
    ['get_combination', { number: 1 }, '/api/v1/combinations/1'],
    [
      'find_combinations',
      { colors: ['hermosa-pink'] },
      '/api/v1/combinations?colors=hermosa-pink',
    ],
    ['nearest_colors', { hex: '#3a5f8c' }, '/api/v1/nearest?hex=3a5f8c'],
  ]
  for (const [name, args, path] of pairs) {
    const result = await call(name, args)
    if (
      result.isError ||
      !isDeepStrictEqual(result.structuredContent?.data, await restData(path))
    )
      fail(
        `MCP ${name} ${JSON.stringify(args)}`,
        `structuredContent differs from ${path}`
      )
    if (!text(result)) fail(`MCP ${name}`, 'no text summary')
  }

  const pink = await call('find_combinations', { colors: ['hermosa-pink'] })
  if (!isDeepStrictEqual(numbers(pink.structuredContent?.data), [176, 227, 273]))
    fail('MCP find_combinations', 'expected 176, 227 and 273')
  const summary = text(await call('get_combination', { number: 1 }))
  for (const part of [
    'English Red',
    '#de4500',
    'Cerulian Blue',
    '#29bdad',
    `${base}/combination/1`,
  ])
    if (!summary.includes(part)) fail('MCP get_combination summary', `missing ${part}`)

  const unknown = await call('get_color', { slug: 'hermosa' })
  if (!unknown.isError || !text(unknown).includes('hermosa-pink'))
    fail(
      'MCP get_color hermosa',
      `expected an error suggesting hermosa-pink, got "${text(unknown)}"`
    )
  const range = await call('get_combination', { number: 400 })
  if (!range.isError || !text(range).includes('1 to 348'))
    fail('MCP get_combination 400', `expected a 1 to 348 error, got "${text(range)}"`)
  const badHex = await call('nearest_colors', { hex: 'blue' })
  if (!badHex.isError) fail('MCP nearest_colors blue', 'expected an error')

  let uris: string[] = []
  let cursor: string | undefined
  do {
    const page = (await rpc('resources/list', cursor ? { cursor } : {})).result ?? {}
    uris = uris.concat(
      (page.resources ?? []).map((resource: { uri: string }) => resource.uri)
    )
    cursor = page.nextCursor
  } while (cursor)
  const colorUris = uris.filter((uri) => uri.startsWith('sanzo://colors/')).length
  const combinationUris = uris.filter((uri) =>
    uri.startsWith('sanzo://combinations/')
  ).length
  if (colorUris !== 159 || combinationUris !== 348)
    fail('MCP resources/list', `${colorUris} colors and ${combinationUris} combinations`)
  const templates =
    (await rpc('resources/templates/list')).result?.resourceTemplates ?? []
  if (templates.length !== 2)
    fail('MCP resources/templates/list', `${templates.length} templates`)

  for (const [uri, path] of [
    ['sanzo://colors/hermosa-pink', '/api/v1/colors/hermosa-pink'],
    ['sanzo://combinations/1', '/api/v1/combinations/1'],
  ]) {
    const read = await rpc('resources/read', { uri })
    const content = read.result?.contents?.[0]?.text
    if (!content || !isDeepStrictEqual(JSON.parse(content), await restData(path)))
      fail(`MCP resources/read ${uri}`, `differs from ${path}`)
  }
  const missing = await rpc('resources/read', { uri: 'sanzo://colors/not-a-color' })
  if (!missing.error)
    fail('MCP resources/read sanzo://colors/not-a-color', 'expected an error')

  checks++
  const get = await fetch(`${base}/api/mcp`, { headers: { Accept: 'text/event-stream' } })
  if (get.status !== 405) fail('GET /api/mcp', `expected 405, got ${get.status}`)
}

const main = async () => {
  const { colors, combinations } = await checkRest()
  const links = await checkLinks(colors, combinations)
  await checkDocs()
  await checkMcp()

  if (failures.length) {
    console.error(failures.join('\n'))
    console.error(`\n${failures.length} failure(s)`)
    process.exit(1)
  }
  console.log(
    `OK: ${checks} checks: REST endpoints and errors, ${links} links, OpenAPI, /llms.txt, MCP tools and resources match REST (${base})`
  )
}

main().catch((error) => {
  // A missing endpoint can break a later step; report what was found so far
  console.error([...failures, `aborted: ${(error as Error).message}`].join('\n'))
  process.exit(1)
})
