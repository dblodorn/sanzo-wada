import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Swatch } from '@/views'
import { colorSlugs, getColorBySlug } from '@/colors'
import {
  CARD_SIZE,
  swatchAlt,
  swatchCardPath,
  swatchDescription,
  swatchTitle,
} from '@/cards/card'

export const dynamicParams = false

export function generateStaticParams() {
  return colorSlugs().map((slug) => ({ slug }))
}

// Share metadata only: the <title> and description stay the layout's
export async function generateMetadata({
  params,
}: PageProps<'/swatch/[slug]'>): Promise<Metadata> {
  const color = getColorBySlug((await params).slug)
  if (!color) return {}
  return {
    openGraph: {
      title: swatchTitle(color),
      description: swatchDescription(color),
      url: `/swatch/${color.slug}`,
      images: [
        {
          url: swatchCardPath(color.slug),
          ...CARD_SIZE,
          type: 'image/png',
          alt: swatchAlt(color),
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function Page({ params }: PageProps<'/swatch/[slug]'>) {
  const { slug } = await params
  const color = getColorBySlug(slug)
  if (!color) notFound()
  return <Swatch {...color} />
}
