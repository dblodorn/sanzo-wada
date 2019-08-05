import React from 'react'
import styled from 'styled-components'
import { comboData, SwatchHeader } from './../components'
import { flexRow, SwatchLink, mediumType, media } from './../styles'
import { spacing, shared } from './../styles/theme.json'

const Swatch = (props) =>
  <React.Fragment>
    <SwatchHeader>
      <ComboTitle>Combination: {props.slug}</ComboTitle>
      <ComboHex>
        {props.colors.map((color, i) =>
          <ComboHexItem key={`${props.slug}-title-${i}`} style={{ color: color.hex }}>
            {color.hex}
          </ComboHexItem>
        )}
      </ComboHex>
    </SwatchHeader>
    <ComboSection>
      <ComboWrapper>
        {props.colors.map((color, i) =>
          <ColorBar key={`${props.slug}-${i}`} style={{ backgroundColor: color.hex }}>
            <SwatchLink to={`/swatch/${color.slug}`}>
              <p className={'name'}>{color.name}</p>
            </SwatchLink>
          </ColorBar>
        )}
      </ComboWrapper>
    </ComboSection>
  </React.Fragment>

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
    left: ${spacing.single_pad};
    top: calc(${spacing.single_pad} + ${shared.nav_height});
    text-align: right;
  }
  .hex {
    right: ${spacing.single_pad};
    top: calc(${spacing.single_pad} + ${shared.nav_height});
  }
  &:hover {
    p {
      opacity: 1;
    }
  }
`

const ComboTitle = styled.h1`
  ${mediumType};
  &:after {
    content: '|';
    padding: 0 ${spacing.single_pad};
  }
  ${media.small`
    padding: 0 ${spacing.single_pad} ${spacing.single_pad};
    &:after {
      content: '';
    }
  `}
`

const ComboHexItem = styled.p`
  ${mediumType};
  margin-right: ${spacing.single_pad};
  width: 100%;
  ${media.small`
    padding-left: ${spacing.single_pad};
  `}
`

const ComboHex = styled.div`
  margin-left: .5rem;
  ${flexRow};
`
