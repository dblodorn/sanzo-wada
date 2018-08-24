import React, { Component } from 'react'
import styled from 'styled-components'
import { swatchData } from './../components'
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
        <SwatchHeader>{this.props.name}</SwatchHeader>
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
  padding: ${spacing.single_pad};
`

const SwatchHeader = styled(H1)`
  color: ${colors.grey};
`
