import { apiError } from '@/api/http'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

// Any path under /api/v1 without its own route
export function GET(request: Request) {
  return apiError(
    'not_found',
    `No API endpoint at ${new URL(request.url).pathname}; see /api/v1/openapi.json`
  )
}
