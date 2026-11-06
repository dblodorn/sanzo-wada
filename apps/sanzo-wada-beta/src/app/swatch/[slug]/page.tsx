import { notFound } from 'next/navigation'
import { Swatch } from '@/views'
import { colorSlugs, getColorBySlug } from '@/colors'

export const dynamicParams = false

export function generateStaticParams() {
  return colorSlugs().map((slug) => ({ slug }))
}

export default async function Page({ params }: PageProps<'/swatch/[slug]'>) {
  const { slug } = await params
  const color = getColorBySlug(decodeURIComponent(slug))
  if (!color) notFound()
  return <Swatch {...color} />
}
