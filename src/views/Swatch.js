import React from 'react'
import styled from 'styled-components'
import chroma from 'chroma-js'
import { swatchData, SwatchHeader, CopyHex } from './../components'
import { flexColumn, ComboLink, ComboHex, bigType, ComboTitle } from './../styles'
import { spacing, colors } from './../styles/theme.json'

const Swatch = (props) => {
  return (
    <React.Fragment>
      <SwatchHeader>
        <ComboTitle>
          {props.name}
        </ComboTitle>
        <ComboHex>
          <CopyHex hex={props.hex} />
        </ComboHex>
      </SwatchHeader>
      <SwatchSection style={{ backgroundColor: props.hex }} hex={props.hex}>
        <ComboHeader><span>Combinations:</span></ComboHeader>
        <ComboList>
          {props.combinations.map((combo, i) =>
            <ComboLink to={`/combination/${combo}`} key={`${props.slug}-${combo}`} hex={props.hex}>{combo}</ComboLink>
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
  * {
    color: ${(props) =>
      chroma.contrast(props.hex, colors.grey) > 2 ? colors.grey : colors.black}!important;
  }
`

const ComboList = styled.menu`
  ${flexColumn};
  padding: 0 ${spacing.single_pad};
`

const ComboHeader = styled.h2`
  ${bigType};
  padding: 0 ${spacing.single_pad} ${spacing.single_pad};
`
