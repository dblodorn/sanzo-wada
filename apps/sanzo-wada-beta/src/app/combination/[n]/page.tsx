import { notFound } from 'next/navigation'
import { Combination } from '@/views'
import { combinationNumbers, getCombination } from '@/colors'

export const dynamicParams = false

export function generateStaticParams() {
  return combinationNumbers().map((n) => ({ n: String(n) }))
}

export default async function Page({ params }: PageProps<'/combination/[n]'>) {
  const { n } = await params
  const combination = /^\d+$/.test(n) ? getCombination(Number(n)) : undefined
  if (!combination) notFound()
  return <Combination {...combination} />
}
