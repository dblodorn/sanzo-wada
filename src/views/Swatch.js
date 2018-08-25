import React, { Component } from 'react'
import styled from 'styled-components'
import { swatchData, SwatchHeader } from './../components'
import { flexColumn, media, H1, ComboLink } from './../styles'
import { colors, spacing, shared } from './../styles/theme.json'

class Swatch extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <SwatchSection style={{backgroundColor: this.props.hex}}>
        <SwatchHeader/>
        <SwatchTitle>{this.props.name}<br/>{this.props.cmyk}<br/>{this.props.rgb}</SwatchTitle>
        <ComboList>
          {this.props.combinations.map((combo, i) => 
            <ComboLink to={`/combination/${combo}`} key={`${this.props.slug}-${combo}`}>{combo}</ComboLink>
          )}
        </ComboList>
      </SwatchSection>
    )
  }
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

const SwatchTitle = styled(H1)`
  color: ${colors.grey};
`
