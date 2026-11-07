import type { Metadata, Viewport } from 'next'
import Document, { GlobalStyle } from '@/Document'
import StyledComponentsRegistry from '@/lib/registry'
import { WindowSizeProvider } from '@/state/WindowSize'
import { siteOrigin } from '@/lib/origin'

export const metadata: Metadata = {
  // Absolute URLs in share metadata use the deployment's own origin
  metadataBase: new URL(siteOrigin()),
  title: 'WADA SANZO | DICTIONARY OF COLOR COMBINATIONS',
  description: "Wada Sanzo's Dictionary of Color Combinations. Published by Seigensha.",
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-css-tags */}
        <link rel="stylesheet" href="/assets/fonts.css" />
      </head>
      <body style={{ backgroundColor: '#ffffff' }}>
        <StyledComponentsRegistry>
          <WindowSizeProvider>
            <GlobalStyle />
            <Document>{children}</Document>
          </WindowSizeProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
