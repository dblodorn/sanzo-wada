import React, { Component } from 'react'
import styled from 'styled-components'
import { swatchData, SwatchHeader } from './../components'
import { flexColumn, media, H1, ComboLink, mediumType } from './../styles'
import { colors, spacing, shared } from './../styles/theme.json'

const Swatch = (props) => {
  return (
    <SwatchSection style={{backgroundColor: props.hex}}>
      <SwatchHeader>
        <SwatchTitle>{props.name}  |  <span style={{color: props.hex}}>{props.hex}</span></SwatchTitle>
      </SwatchHeader>
      <ComboList>
        {props.combinations.map((combo, i) => 
          <ComboLink to={`/combination/${combo}`} key={`${props.slug}-${combo}`}>{combo}</ComboLink>
        )}
      </ComboList>
    </SwatchSection>
  )
}

export default swatchData(Swatch)

// STYLES
const SwatchSection = styled.section`
  ${flexColumn};
  width: 100%;
  flex: 1;
  padding-top: calc(${spacing.single_pad} + ${shared.nav_height});
  padding-left: ${spacing.single_pad};
  padding-right: ${spacing.single_pad};
  padding-bottom: ${spacing.double_pad};
`

const ComboList = styled.menu`
  ${flexColumn};
`

const SwatchTitle = styled.h1`
  ${mediumType};
`
