import React from 'react'
import styled from 'styled-components'
import { swatchData, SwatchHeader } from './../components'
import { flexColumn, ComboLink, mediumType, media, bigType } from './../styles'
import { spacing, shared, colors } from './../styles/theme.json'

const Swatch = (props) => {
  return (
    <React.Fragment>
      <SwatchHeader>
        <SwatchTitle>{props.name}  |  <span style={{ color: props.hex }}>{props.hex}</span></SwatchTitle>
      </SwatchHeader>
      <SwatchSection style={{ backgroundColor: props.hex }}>
        <ComboTitle><span>Combinations:</span></ComboTitle>
        <ComboList>
          {props.combinations.map((combo, i) =>
            <ComboLink to={`/combination/${combo}`} key={`${props.slug}-${combo}`}>{combo}</ComboLink>
          )}
        </ComboList>
      </SwatchSection>
    </React.Fragment>
  )
}

export default swatchData(Swatch)

// STYLES
const SwatchSection = styled.section`
  ${flexColumn};
  width: 100%;
  flex: 1;
  padding: ${spacing.double_pad} 0 ${spacing.big_pad};
`

const ComboList = styled.menu`
  ${flexColumn};
  padding: 0 ${spacing.single_pad};
  border-bottom: 1px solid ${colors.grey};
`

const ComboTitle = styled.h2`
  ${bigType};
  padding: 0 ${spacing.single_pad} ${spacing.single_pad};
  color: ${colors.grey};
`

const SwatchTitle = styled.h1`
  ${mediumType};
  ${media.small`
    padding: 0 ${spacing.single_pad};
  `}
`
