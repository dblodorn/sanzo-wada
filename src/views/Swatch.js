import React from 'react'
import styled from 'styled-components'
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
      <SwatchSection style={{ backgroundColor: props.hex }}>
        <ComboHeader><span>Combinations:</span></ComboHeader>
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

const ComboHeader = styled.h2`
  ${bigType};
  padding: 0 ${spacing.single_pad} ${spacing.single_pad};
  color: ${colors.grey};
`
