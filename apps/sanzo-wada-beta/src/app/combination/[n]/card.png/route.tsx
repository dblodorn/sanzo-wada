import { ImageResponse } from 'next/og'
import { combinationNumbers, getCombination } from '@/colors'
import { CARD_SIZE } from '@/cards/card'
import { cardFonts } from '@/cards/fonts'
import CombinationCard from '@/cards/CombinationCard'

// One share card per combination, rendered at build time
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return combinationNumbers().map((n) => ({ n: String(n) }))
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/combination/[n]/card.png'>
) {
  const { n } = await params
  const combination = /^\d+$/.test(n) ? getCombination(Number(n)) : undefined
  if (!combination) return new Response('Not found', { status: 404 })
  return new ImageResponse(<CombinationCard {...combination} />, {
    ...CARD_SIZE,
    fonts: await cardFonts(),
  })
}
