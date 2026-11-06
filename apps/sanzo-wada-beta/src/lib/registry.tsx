'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { useState } from 'react'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

// Collects styled-components CSS during pre-rendering so every static page ships
// its styles. Vendor prefixes are on to match styled-components 3 (alpha).
export default function StyledComponentsRegistry({ children }: { children: React.ReactNode }) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return <>{styles}</>
  })

  if (typeof window !== 'undefined') {
    return <StyleSheetManager enableVendorPrefixes>{children}</StyleSheetManager>
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance} enableVendorPrefixes>
      {children}
    </StyleSheetManager>
  )
}
