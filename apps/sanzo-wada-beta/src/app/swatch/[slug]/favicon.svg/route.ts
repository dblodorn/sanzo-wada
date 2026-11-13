import { colorSlugs, getColorBySlug } from '@/colors'
import { iconSvg } from '@/icons/icon'

// One favicon per color, rendered at build time
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return colorSlugs().map((slug) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/swatch/[slug]/favicon.svg'>
) {
  const { slug } = await params
  const color = getColorBySlug(slug)
  if (!color) return new Response('Not found', { status: 404 })
  return new Response(iconSvg([color.hex]), {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
}
