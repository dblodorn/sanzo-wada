import { searchColors } from '@/colors'
import { list, originOf, parseQuery } from '@/api/http'
import { toColorResource } from '@/api/resources'
import { colorsQuerySchema } from '@/api/schemas'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export function GET(request: Request) {
  const query = parseQuery(colorsQuerySchema, request)
  if ('response' in query) return query.response
  const origin = originOf(request)
  return list(
    searchColors(query.data.q, query.data.group).map((color) =>
      toColorResource(color, origin)
    )
  )
}
