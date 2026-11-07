import { ImageResponse } from 'next/og'
import { colorSlugs, getColorBySlug } from '@/colors'
import { CARD_SIZE } from '@/cards/card'
import { cardFonts } from '@/cards/fonts'
import SwatchCard from '@/cards/SwatchCard'

// One share card per color, rendered at build time
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return colorSlugs().map((slug) => ({ slug }))
}

export async function GET(
  _request: Request,
  { params }: RouteContext<'/swatch/[slug]/card.png'>
) {
  const { slug } = await params
  const color = getColorBySlug(slug)
  if (!color) return new Response('Not found', { status: 404 })
  return new ImageResponse(<SwatchCard name={color.name} hex={color.hex} />, {
    ...CARD_SIZE,
    fonts: await cardFonts(),
  })
}
