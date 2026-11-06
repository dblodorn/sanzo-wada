import { allColors } from '@/colors'

// The public JSON API, generated from the color library at build time
export const dynamic = 'force-static'

export function GET() {
  return Response.json({ colors: allColors })
}
