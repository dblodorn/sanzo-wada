import React from 'react'
import styled from 'styled-components'
import { H1 } from './../styles'
import { spacing, shared, breakpoints } from './../styles/theme.json'

export default () =>
  <TitleWrapper>
    <H1>Sanzo Wada | A Dictionary of Color Combinations.</H1>
  </TitleWrapper>

// STYLES
const TitleWrapper = styled.div`
  display: flex;
  height: ${shared.nav_height};
  align-items: center;
  padding: 0 ${spacing.single_pad};
`
