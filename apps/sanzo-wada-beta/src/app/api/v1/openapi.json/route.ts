import { CACHE_OK, originOf } from '@/api/http'
import { openApiDocument } from '@/api/openapi'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export function GET(request: Request) {
  return Response.json(openApiDocument(originOf(request)), {
    headers: {
      'Cache-Control': CACHE_OK,
    },
  })
}
