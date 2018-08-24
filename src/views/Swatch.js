import React, { Component } from 'react'
import styled from 'styled-components'
import { swatchData, SwatchHeader } from './../components'
import { flexRow, StyledButton, media, H1 } from './../styles'
import { colors, spacing, shared, breakpoints } from './../styles/theme.json'

const returnStyle = (color) => {
  return {
    backgroundColor: color
  }
}

class Swatch extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }
  render() {
    return (
      <SwatchSection style={returnStyle(this.props.hex)}>
        <SwatchHeader/>
        <SwatchTitle>{this.props.name}</SwatchTitle>
      </SwatchSection>
    )
  }
}

export default swatchData(Swatch)

// STYLES
const SwatchSection = styled.section`
  display: flex;
  width: 100%;
  height: 100vh;
  padding-top: calc(${spacing.single_pad} + ${shared.nav_height});
  padding-left: ${spacing.single_pad};
  padding-right: ${spacing.single_pad};
  padding-bottom: ${spacing.double_pad};
`

const SwatchTitle = styled(H1)`
  color: ${colors.grey};
`
