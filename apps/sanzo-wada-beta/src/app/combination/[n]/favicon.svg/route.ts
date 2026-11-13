import { combinationNumbers, getCombination } from '@/colors'
import { iconSvg } from '@/icons/icon'

// One favicon per combination, rendered at build time
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return combinationNumbers().map((n) => ({ n: String(n) }))
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/combination/[n]/favicon.svg'>
) {
  const { n } = await params
  const combination = /^\d+$/.test(n) ? getCombination(Number(n)) : undefined
  if (!combination) return new Response('Not found', { status: 404 })
  return new Response(iconSvg(combination.colors.map((color) => color.hex)), {
    headers: { 'Content-Type': 'image/svg+xml' },
  })
}
