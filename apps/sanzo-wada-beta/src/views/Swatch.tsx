'use client'

import styled from 'styled-components'
import { SwatchHeader, CopyHex } from './../components'
import type { Color } from './../colors'
import { flexColumn, ComboLink, ComboHex, bigType, ComboTitle } from './../styles'
import { textColorOn } from './../styles/textColor'
import { spacing } from './../styles/theme.json'

export default function Swatch(props: Color) {
  return (
    <>
      <SwatchHeader>
        <ComboTitle>{props.name}</ComboTitle>
        <ComboHex>
          <CopyHex hex={props.hex} />
        </ComboHex>
      </SwatchHeader>
      <SwatchSection style={{ backgroundColor: props.hex }} $hex={props.hex}>
        <ComboHeader>
          <span>Combinations:</span>
        </ComboHeader>
        <ComboList>
          {props.combinations.map((combo) => (
            <ComboLink
              href={`/combination/${combo}`}
              key={`${props.slug}-${combo}`}
              $hex={props.hex}
            >
              {combo}
            </ComboLink>
          ))}
        </ComboList>
      </SwatchSection>
    </>
  )
}

// STYLES
const SwatchSection = styled.section<{ $hex: string }>`
  ${flexColumn};
  width: 100%;
  flex: 1;
  padding: ${spacing.double_pad} 0 ${spacing.big_pad};
  * {
    color: ${(props) => textColorOn(props.$hex)}!important;
  }
`

const ComboList = styled.menu`
  ${flexColumn};
  padding: 0 ${spacing.single_pad};
`

const ComboHeader = styled.h2`
  ${bigType};
  padding: 0 ${spacing.single_pad} ${spacing.single_pad};
`
