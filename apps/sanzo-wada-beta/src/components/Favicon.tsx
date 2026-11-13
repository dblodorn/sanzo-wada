'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { combinationIconPath, swatchIconPath } from '@/icons/icon'

// The one favicon link for every page. Swatch and combination pages get their
// own icon; every other page gets a random swatch. The random pick runs after
// mount (and on each navigation), so the pre-rendered HTML and hydration use
// the first color.
export default function Favicon({
  slugs,
  combinationCount,
}: {
  slugs: string[]
  combinationCount: number
}) {
  const pathname = usePathname()
  const [randomSlug, setRandomSlug] = useState(slugs[0])
  const href = pagePath(pathname, slugs, combinationCount)

  useEffect(() => {
    if (!href) setRandomSlug(slugs[Math.floor(Math.random() * slugs.length)])
  }, [pathname, href, slugs])

  return (
    <link rel="icon" type="image/svg+xml" href={href ?? swatchIconPath(randomSlug)} />
  )
}

// The page's own icon, or undefined for a page that gets a random one
function pagePath(pathname: string, slugs: string[], combinationCount: number) {
  const parts = pathname.split('/')
  if (parts.length !== 3) return undefined
  const [, section, id] = parts
  if (section === 'swatch' && slugs.includes(id)) return swatchIconPath(id)
  if (section === 'combination' && /^\d+$/.test(id ?? '')) {
    const n = Number(id)
    if (n >= 1 && n <= combinationCount) return combinationIconPath(n)
  }
  return undefined
}
