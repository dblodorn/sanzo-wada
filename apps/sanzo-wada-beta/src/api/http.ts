import type { z } from 'zod'
import type { ErrorCode } from './schemas'

// Data only changes on deploy, and each Vercel deployment starts with an empty
// CDN cache, so successful responses can be cached for a long time.
export const CACHE_OK = 'public, max-age=300, s-maxage=31536000, stale-while-revalidate=86400'
const CACHE_ERROR = 'public, max-age=60'

const STATUS: Record<ErrorCode, number> = {
  invalid_parameter: 400,
  not_found: 404,
  method_not_allowed: 405,
}

export const originOf = (request: Request): string => new URL(request.url).origin

export const ok = (data: unknown): Response =>
  Response.json({ data }, { headers: { 'Cache-Control': CACHE_OK } })

export const list = (data: readonly unknown[]): Response =>
  Response.json({ data, count: data.length }, { headers: { 'Cache-Control': CACHE_OK } })

export const apiError = (code: ErrorCode, message: string): Response =>
  Response.json(
    { error: { code, message } },
    {
      status: STATUS[code],
      headers: {
        'Cache-Control': CACHE_ERROR,
        ...(code === 'method_not_allowed' && { Allow: 'GET, HEAD, OPTIONS' }),
      },
    }
  )

export const notFound = (what: string): Response =>
  apiError('not_found', `${what} not found`)

// Parses the query string, or returns the 400 for the first invalid parameter
export const parseQuery = <T extends z.ZodType>(
  schema: T,
  request: Request
): { data: z.output<T> } | { response: Response } => {
  const params = Object.fromEntries(new URL(request.url).searchParams)
  const result = schema.safeParse(params)
  if (result.success) return { data: result.data }
  const issue = result.error.issues[0]
  return {
    response: apiError('invalid_parameter', `${issue.path.join('.')} ${issue.message}`),
  }
}

// Every API route re-exports these, so write methods get a JSON 405 and
// preflight gets a 204. CORS headers come from next.config.ts.
const methodNotAllowed = (request: Request): Response =>
  apiError('method_not_allowed', `${request.method} is not allowed; the API is read-only`)

export const POST = methodNotAllowed
export const PUT = methodNotAllowed
export const PATCH = methodNotAllowed
export const DELETE = methodNotAllowed
export const OPTIONS = (): Response => new Response(null, { status: 204 })
