import React from 'react'
import styled from 'styled-components'
import { SwatchHeader, Title } from './../components'
import { Section, PBig, media } from './../styles'
import { spacing } from './../styles/theme.json'

export default () =>
  <Section>
    <SwatchHeader>
      <Title/>
    </SwatchHeader>
    <AboutCopy>
      <PBig>348 color combinations originated by Sanzo Wada (1883-1967) who, in that time of increasingly avant-grade and diversified use of color, was quick to focus on the importance of color and laid the foundation for contemporary color research. Sanzo Wada was active as an artist, art school instructor, costume designer for the movies and the theater, and kimono and fashion designer who employed his extensive and versatile talents to do innovative work that centered primarily on visual perception and form.</PBig>
    </AboutCopy>
  </Section>

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