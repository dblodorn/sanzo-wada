import React from 'react'
import styled from 'styled-components'
import { spacing, colors } from './../styles/theme.json'
import { H1Big, H2Big, PBig, media } from '../styles'

export default () =>
  <AboutCopy>
    <H1Big>A Dictionary of Color Combinations.<br/>By Sanzo Wada</H1Big>
    <PBig>348 color combinations originated by Sanzo Wada (1883-1967) who, in that time of increasingly avant-grade and diversified use of color, was quick to focus on the importance of color and laid the foundation for contemporary color research. Sanzo Wada was active as an artist, art school instructor, costume designer for the movies and the theater, and kimono and fashion designer who employed his extensive and versatile talents to do innovative work that centered primarily on visual perception and form.</PBig>
  </AboutCopy>

// STYLES
const AboutCopy = styled.article`
  width: 100%;
  padding-top: 10vh;
  padding-bottom: 10vh;
  padding-left: ${spacing.double_pad};
  ${media.small`
    padding-top: ${spacing.double_pad};
    padding-bottom: ${spacing.double_pad};
  `}
`