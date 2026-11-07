import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// The site's fff fonts for next/og. Satori reads woff (not woff2). Cards only
// render at build time, so reading from public/ needs no file tracing.
const FONT_DIR = join(process.cwd(), 'public/assets/fonts')

let loading: Promise<{ name: string; data: ArrayBuffer; style: 'normal' }[]> | undefined

const load = async (file: string) => {
  const buffer = await readFile(join(FONT_DIR, file))
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer
}

export const cardFonts = () =>
  (loading ??= Promise.all([load('fff-Regular_gdi.woff')]).then(([regular]) => [
    { name: 'fff-regular', data: regular, style: 'normal' as const },
  ]))
