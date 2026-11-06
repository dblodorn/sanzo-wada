import { COMBINATION_COUNT, getCombination } from '@/colors'
import { apiError, ok, originOf } from '@/api/http'
import { toCombinationResource } from '@/api/resources'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export async function GET(
  request: Request,
  { params }: RouteContext<'/api/v1/combinations/[n]'>
) {
  const { n } = await params
  const combination = /^[0-9]+$/.test(n) ? getCombination(Number(n)) : undefined
  if (!combination) {
    return apiError(
      'not_found',
      `Combination "${n}" not found; numbers run from 1 to ${COMBINATION_COUNT}`
    )
  }
  return ok(toCombinationResource(combination, originOf(request)))
}
