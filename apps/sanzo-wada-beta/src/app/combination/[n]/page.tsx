import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Combination } from '@/views'
import { combinationNumbers, getCombination } from '@/colors'
import {
  CARD_SIZE,
  combinationAlt,
  combinationCardPath,
  combinationDescription,
  combinationTitle,
} from '@/cards/card'

const findCombination = (n: string) =>
  /^\d+$/.test(n) ? getCombination(Number(n)) : undefined

export const dynamicParams = false

export function generateStaticParams() {
  return combinationNumbers().map((n) => ({ n: String(n) }))
}

// Share metadata only: the <title> and description stay the layout's
export async function generateMetadata({
  params,
}: PageProps<'/combination/[n]'>): Promise<Metadata> {
  const combination = findCombination((await params).n)
  if (!combination) return {}
  return {
    openGraph: {
      title: combinationTitle(combination),
      description: combinationDescription(combination),
      url: `/combination/${combination.number}`,
      images: [
        {
          url: combinationCardPath(combination.number),
          ...CARD_SIZE,
          type: 'image/png',
          alt: combinationAlt(combination),
        },
      ],
    },
    twitter: { card: 'summary_large_image' },
  }
}

export default async function Page({ params }: PageProps<'/combination/[n]'>) {
  const { n } = await params
  const combination = findCombination(n)
  if (!combination) notFound()
  return <Combination {...combination} />
}
