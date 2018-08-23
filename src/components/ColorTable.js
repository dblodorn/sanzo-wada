import React, { Fragment } from 'react'
import styled from 'styled-components'
import { colors, breakpoints } from './../styles/theme.json'
import { smallType, media } from './../styles'
import SwatchWrapper from './SwatchWrapper'

const returnStyle = (color) => {
  return {
    backgroundColor: color
  }
}

export default (props) =>
  <ColorIndex>
    <tbody>
      {props.colorList.map((color, i) =>
        <tr key={`c-list_${color.index}-${i}`} style={returnStyle(color.hex)}>
          <td>{color.index}</td>
          <td>{color.name}</td>
          <td className={'captialize'}>{color.hex}</td>
          <td>{color.cmyk}</td>
          {(props.breakPoint >= breakpoints.desktop) &&
            <Fragment>
              <td>{color.rgb}</td>
              <td>COMBOS: {color.combinations}</td>
              <td>USAGE: {color.use_count}</td>
            </Fragment>
          }
        </tr>
      )}
    </tbody>
  </ColorIndex>

// STYLES
const ColorIndex = styled.table`
  width: 100%;
  text-align: left;
  color: ${colors.grey};
  ${smallType};
  line-height: 1.125;
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
  }
`