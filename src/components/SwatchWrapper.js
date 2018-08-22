import React from 'react'
import styled from 'styled-components'
import { colors, spacing, shared } from './../styles/theme.json'
import { flexRowCenteredVert, Section, H2, media } from './../styles'

export default (props) =>
  <Section>
    <SectionHeader>
      <H2>SWATCH COLLECTION {props.indexNo + 1}</H2>
    </SectionHeader>
    {props.children}
  </Section>

// STYLES
const SectionHeader = styled.div`
  ${flexRowCenteredVert};
  padding-left: ${spacing.single_pad};
  background-color: ${colors.white};
  position: -webkit-sticky;
  position: sticky;
  top: ${shared.nav_height};
  height: ${shared.nav_height};
  z-index: 100;
  border-bottom: 1px solid ${colors.med_grey};
  color: ${colors.med_grey};
  text-align: left;
`