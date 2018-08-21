import React from 'react'
import styled from 'styled-components'
import { withStore } from './../components'
import { colors } from './../styles/theme.json'
import { Section, mediumType } from './../styles'

const returnStyle = (color) => {
  return {
    backgroundColor: color
  }
}

export default withStore((props) =>
  <Section>
    <ColorIndex>
      <thead>
        <tr>
          <th>INDEX</th>
          <th>NAME</th>
          <th>CMYK</th>
          <th>HEX VALUE</th>
        </tr>
      </thead>
      <tbody>
        {props.color_data.color_list.map((color, i) =>
          <tr key={i} style={returnStyle(color.hex)}>
            <td>{color.index}</td>
            <td>{color.name}</td>
            <td>{color.cmyk}</td>
            <td>{color.hex}</td>
          </tr>
        )}
      </tbody>
    </ColorIndex>
  </Section>
)

// STYLES
const ColorIndex = styled.table`
  width: 100%;
  text-align: left;
  ${mediumType};
  th {
    border-right: 1px solid ${colors.grey};
    &:last-child {
      border-right: 0;
    }
  }
  td,
  th {
    padding: 1rem;
  }
`