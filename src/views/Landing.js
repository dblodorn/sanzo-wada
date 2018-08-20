import React from 'react'
import colors from './../colors'
import { Section } from './../styles'

export default () =>
  <Section>
    <h1>Sanzo Wada's Dictionary of Color Combinations.</h1>
    <div>
      {colors().map((color, i) =>
        <h2 key={i}>{color.name}</h2>
      )}
    </div>
  </Section>