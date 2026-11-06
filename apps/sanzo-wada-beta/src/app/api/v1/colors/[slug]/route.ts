import { getColorBySlug, legacySlugs } from '@/colors'
import { notFound, ok, originOf } from '@/api/http'
import { toColorDetail } from '@/api/resources'

export { DELETE, OPTIONS, PATCH, POST, PUT } from '@/api/http'

export async function GET(
  request: Request,
  { params }: RouteContext<'/api/v1/colors/[slug]'>
) {
  const { slug } = await params
  // Alpha's punctuated slugs answer directly rather than redirecting
  const decoded = decodeURIComponent(slug)
  const color = getColorBySlug(legacySlugs[decoded] ?? decoded)
  if (!color) return notFound(`Color "${decoded}"`)
  return ok(toColorDetail(color, originOf(request)))
}
