import React, { Fragment } from 'react'
import styled from 'styled-components'
import SwatchWrapper from './SwatchWrapper'
import { colors, spacing } from './../styles/theme.json'
import { smallType, flexRowWrap, flexRow, media } from './../styles'

const returnStyle = (color) => {
  return {
    backgroundColor: color
  }
}

const Swatches = (props) => {
  return (
    <SwatchWrapper indexNo={props.indexNo}>
      <SwatchBook>
        {props.colorList.map((color, i) =>
          <Swatch key={`c-list_${color.index}-${i}`} style={returnStyle(color.hex)}>
            <p className={'index'}>{color.index}</p>
            <p className={'name'}>{color.name}</p>
            <p className={'hex'}>{color.hex}</p>
          </Swatch>
        )}
      </SwatchBook>
    </SwatchWrapper>
  )
}

export default (props) => 
  <Fragment>
    {props.colorList.map((colors, i) =>
      <Swatches colorList={colors.swatches} indexNo={i} key={`cs_${i}`}/>
    )}
  </Fragment>

// STYLES
const SwatchBook = styled.ul`
  z-index: 1;
  ${flexRowWrap};
  width: 100%;
  ${smallType};
  color: ${colors.grey};
  border-bottom: 1px solid ${colors.med_grey};
  p {
    display: ${flexRow};
    padding: .5rem 0;
  }
`

const Swatch = styled.li`
  width: 20vw;
  height: 20vw;
  position: relative;
  ${ media.medium`
    width: calc(100vw / 3);
    height: calc(100vw / 3);
  `}
  ${ media.small`
    width: 100%;
    height: 56.25vw;
  `}
  p {
    position: absolute;
    display: block;
  }
  .index {
    top: ${spacing.single_pad};
    left: ${spacing.single_pad};
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
`