import type { NextConfig } from 'next'
import { legacySlugs } from './src/colors/legacySlugs'

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // The API and the MCP server are public and read-only: any origin may call them
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, HEAD, POST, OPTIONS' },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Accept, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
          },
          { key: 'Access-Control-Expose-Headers', value: 'Mcp-Session-Id, Mcp-Protocol-Version' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ]
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
