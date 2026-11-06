'use client'

import Link from 'next/link'
import styled from 'styled-components'
import { H1, media } from './../styles'
import { spacing, shared } from './../styles/theme.json'

export default function Title() {
  return (
    <TitleWrapper>
      <Link href={'/'}>
        <H1>Wada Sanzo | A Dictionary of Color Combinations.</H1>
      </Link>
    </TitleWrapper>
  )
}

// STYLES
const TitleWrapper = styled.div`
  display: flex;
  height: ${shared.nav_height};
  align-items: center;
  padding: 0;
  padding-left: ${spacing.single_pad};
  * {
    text-decoration: none;
  }
  h1 {
    padding-bottom: 0!important;
  }
  ${media.small`
    padding-left: 0;
  `}
`
