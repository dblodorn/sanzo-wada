import { createMcpHandler } from '@modelcontextprotocol/server'
import { createServer } from '@/mcp/server'

// Stateless: a fresh server per request, serving both the 2026-07-28 protocol
// and 2025-era clients, answering with JSON rather than SSE
export const dynamic = 'force-dynamic'

const handler = createMcpHandler(
  ({ requestInfo }) =>
    createServer(new URL(requestInfo?.url ?? 'https://sanzo-wada.dmbk.io').origin),
  { responseMode: 'json' }
)

const serve = async (request: Request): Promise<Response> => {
  const response = await handler.fetch(request)
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-store')
  return new Response(response.body, { status: response.status, headers })
}

export const GET = serve
export const POST = serve
export const DELETE = serve
