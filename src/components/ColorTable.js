import React, { Fragment } from 'react'
import styled from 'styled-components'
import { colors } from './../styles/theme.json'
import { smallType } from './../styles'
import SwatchWrapper from './SwatchWrapper'

const returnStyle = (color) => {
  return {
    backgroundColor: color
  }
}

const TableLayout = (props) => {
  return (
    <SwatchWrapper indexNo={props.indexNo}>
      <ColorIndex>
        <tbody>
          {props.colorList.map((color, i) =>
            <tr key={`c-list_${color.index}-${i}`} style={returnStyle(color.hex)}>
              <td>{color.index}</td>
              <td>{color.name}</td>
              <td className={'captialize'}>{color.hex}</td>
              <td>{color.cmyk}</td>
              <td>{color.rgb}</td>
              <td>COMBOS: {color.combinations}</td>
              <td>USAGE: {color.use_count}</td>
            </tr>
          )}
        </tbody>
      </ColorIndex>
    </SwatchWrapper>
  )
}

export default (props) => 
  <Fragment>
    {props.colorList.map((colors, i) =>
      <TableLayout colorList={colors.swatches} indexNo={i} key={`ct_${i}`}/>
    )}
  </Fragment>

// STYLES
const ColorIndex = styled.table`
  width: 100%;
  text-align: left;
  color: ${colors.grey};
  ${smallType};
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