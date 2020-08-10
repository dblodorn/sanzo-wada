import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { H1, media } from './../styles'
import { spacing, shared } from './../styles/theme.json'

export default () =>
  <TitleWrapper>
    <Link to={'/'}>
      <H1>Sanzo Wada | A Dictionary of Color Combinations.</H1>
    </Link>
  </TitleWrapper>

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
