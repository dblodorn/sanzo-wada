import React from 'react'
import styled from 'styled-components'
import { spacing, colors } from './../styles/theme.json'
import { H1, media } from './../styles'

export default () =>
  <Header>
    <H1>Sanzo Wada's Dictionary of Color Combinations.</H1>
  </Header>

// STYLES
const Header = styled.header`
  width: 100%;
  padding-top: 17vh;
  padding-bottom: 17vh;
  padding-left: ${spacing.double_pad}; 
  border-bottom: 1px solid ${colors.med_grey};
  ${ media.small`
  padding-top: ${spacing.double_pad};
  padding-bottom: ${spacing.double_pad};
  `}
`