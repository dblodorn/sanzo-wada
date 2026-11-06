import { nearestColors } from '@/colors'
import { list, originOf, parseQuery } from '@/api/http'
import { toNearestResource } from '@/api/resources'
import { nearestQuerySchema } from '@/api/schemas'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export function GET(request: Request) {
  const query = parseQuery(nearestQuerySchema, request)
  if ('response' in query) return query.response
  const origin = originOf(request)
  // The schema has already checked hex and limit
  const nearest = nearestColors(query.data.hex, query.data.limit) ?? []
  return list(nearest.map((entry) => toNearestResource(entry, origin)))
}
