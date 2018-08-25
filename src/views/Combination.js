import React, { Component } from 'react'
import styled from 'styled-components'
import { comboData, SwatchHeader } from './../components'
import { flexRow, SwatchLink, media, H1 } from './../styles'
import { colors, spacing, shared, breakpoints } from './../styles/theme.json'

class Swatch extends Component {
  constructor(props) {
    super(props)
    console.log(this.props)
  }
  render() {
    return (
      <ComboSection>
        <SwatchHeader/>
        <InfoWrapper>
          <ComboTitle>{this.props.slug}</ComboTitle>
        </InfoWrapper>
        <ComboWrapper>
          {this.props.colors.map((color, i) => 
            <ColorBar key={`${this.props.slug}-${i}`} style={{backgroundColor: color.hex}}>
              <SwatchLink to={`/swatch/${color.slug}`}>
                <p className={'name'}>{color.name}</p>
                <p className={'hex'}>{color.hex}</p>
              </SwatchLink>
            </ColorBar>
          )}
        </ComboWrapper>
      </ComboSection>
    )
  }
}

export default comboData(Swatch)

// STYLES
const ComboSection = styled.section`
  display: flex;
  width: 100%;
  height: 100vh;
  padding-top: calc(${spacing.single_pad} + ${shared.nav_height});
  padding-left: ${spacing.single_pad};
  padding-right: ${spacing.single_pad};
  padding-bottom: ${spacing.double_pad};
`

const ComboWrapper = styled.div`
  ${flexRow};
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 0;
`

const InfoWrapper = styled.div`
  ${flexRow};
  width: 100%;
  position: fixed;
  top: ${shared.nav_height};
  left: 0;
  z-index: 10;
  padding: ${spacing.single_pad};
`

const ColorBar = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1;
  padding: ${spacing.single_pad};
  p {
    position: absolute;
    display: block;
    opacity: 0;
    transition: opacity 300ms ease;
    will-change: opacity;
  }
  .name {
    right: ${spacing.single_pad};
    bottom: ${spacing.single_pad};
    text-align: right;
  }
  .hex {
    left: ${spacing.single_pad};
    bottom: ${spacing.single_pad};
  }
  &:hover {
    p {
      opacity: 1;
    }
  }
`

const ComboTitle = styled(H1)`
  color: ${colors.grey};
`
