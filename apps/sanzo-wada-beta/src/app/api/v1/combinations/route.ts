import { combinationNumbers, combinationsWith, getCombination } from '@/colors'
import type { Combination } from '@/colors'
import { apiError, list, originOf, parseQuery } from '@/api/http'
import { toCombinationResource } from '@/api/resources'
import { combinationsQuerySchema } from '@/api/schemas'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export function GET(request: Request) {
  const query = parseQuery(combinationsQuerySchema, request)
  if ('response' in query) return query.response
  const { colors, size } = query.data
  let combinations: Combination[]
  if (colors) {
    const result = combinationsWith(colors, size)
    if ('unknownSlug' in result) {
      return apiError(
        'invalid_parameter',
        `colors contains "${result.unknownSlug}", which is not a color slug`
      )
    }
    combinations = result.combinations
  } else {
    combinations = combinationNumbers()
      .map((n) => getCombination(n) as Combination)
      .filter((combination) => size === undefined || combination.colors.length === size)
  }
  const origin = originOf(request)
  return list(
    combinations.map((combination) => toCombinationResource(combination, origin))
  )
}
