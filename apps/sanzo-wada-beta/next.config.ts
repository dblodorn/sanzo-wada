import type { NextConfig } from 'next'
import { legacySlugs } from './src/colors/legacySlugs'

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // Alpha's punctuated swatch URLs move permanently to the normalized slugs.
  // Sources match the raw path, so list the percent-encoded spellings too.
  async redirects() {
    return Object.entries(legacySlugs).flatMap(([legacy, slug]) => {
      const encoded = encodeURIComponent(legacy).replace(/'/g, '%27')
      const spellings = new Set([
        legacy,
        encoded,
        encoded.replace(/%[0-9A-F]{2}/g, (e) => e.toLowerCase()),
      ])
      return [...spellings].map((spelling) => ({
        source: `/swatch/${spelling}`,
        destination: `/swatch/${slug}`,
        permanent: true,
      }))
    })
  },
}

export default nextConfig
