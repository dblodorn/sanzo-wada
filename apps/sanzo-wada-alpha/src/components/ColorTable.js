import React, { Fragment } from 'react'
import styled from 'styled-components'
import chroma from 'chroma-js'
import { colors, breakpoints } from './../styles/theme.json'
import { smallType, SmallLink } from './../styles'

const returnStyle = (color) => {
  return {
    backgroundColor: color
  }
}

export default (props) =>
  <ColorIndex>
    <tbody>
      {props.colorList.map((color, i) =>
        <ColorTr key={`c-list_${color.index}-${i}`} style={returnStyle(color.hex)} hex={color.hex}>
          <td>{color.index}</td>
          <td>
            <SmallLink to={`/swatch/${color.slug}`}>{color.name}</SmallLink>
          </td>
          <td className={'captialize'}>{color.hex}</td>
          {(props.breakPoint >= breakpoints.desktop) &&
            <Fragment>
              <td>
                {color.combinations.map((combo, i) => 
                  <SmallLink to={`/combination/${combo}`} key={`${combo}-${i}`}>{combo}</SmallLink>
                )}
              </td>
              <td>{color.cmyk}</td>
              <td>{color.rgb}</td>
              <td>{color.use_count}</td>
            </Fragment>
          }
        </ColorTr>
      )}
    </tbody>
  </ColorIndex>

// STYLES
const ColorTr = styled.tr`
  th {
    border-right: 1px solid ${colors.grey};
    padding: 1rem;
    &:last-child {
      border-right: 0;
    }
  }
  td,
  th {
    &:first-child {
      width: 1.5rem;
    }
    &.captialize {
      text-transform: uppercase;
    }
  }
  td {
    padding: 5rem 1rem;
    a {
      margin-right: .5rem;
    }
  }
  * {
    color: ${(props) =>
      chroma.contrast(props.hex, colors.grey) > 2 ? colors.grey : colors.black}!important;
  }
`

const ColorIndex = styled.table`
  ${smallType};
  width: 100%;
  text-align: left;
  line-height: 1.125;
`