'use client'

import styled from 'styled-components'
import { SwatchHeader, CopyHex } from './../components'
import { COMBINATION_COUNT, type Combination as CombinationData } from './../colors'
import { flexRow, SwatchLink, ComboTitle, ComboHex, ButtonLink, media } from './../styles'
import { spacing, shared } from './../styles/theme.json'

export default function Combination(props: CombinationData) {
  const slug = props.number
  return (
    <>
      <SwatchHeader>
        <ComboTitle>Combination: {slug}</ComboTitle>
        <ComboHex>
          {props.colors.map((color, i) => (
            <CopyHex hex={color.hex} key={`${slug}-title-${i}`} />
          ))}
        </ComboHex>
        <PrevNext>
          {slug !== 1 && (
            <ButtonLink className="prev" href={`/combination/${slug - 1}`}>
              <span>Prev</span>
            </ButtonLink>
          )}
          {slug !== COMBINATION_COUNT && (
            <ButtonLink className="next" href={`/combination/${slug + 1}`}>
              <span>Next</span>
            </ButtonLink>
          )}
        </PrevNext>
      </SwatchHeader>
      <ComboSection>
        <ComboWrapper>
          {props.colors.map((color, i) => (
            <ColorBar key={`${slug}-${i}`} style={{ backgroundColor: color.hex }}>
              <SwatchLink href={`/swatch/${color.slug}`} $hex={color.hex}>
                <p className={'name'}>{color.name}</p>
              </SwatchLink>
            </ColorBar>
          ))}
        </ComboWrapper>
      </ComboSection>
    </>
  )
}

// STYLES
const PrevNext = styled.div`
  ${flexRow};
  align-items: center;
  height: 100%;
  margin-left: auto;
  a:first-child {
    margin-right: ${spacing.single_pad};
  }
  ${media.small`
    margin-left: 0;
    margin-top: ${spacing.single_pad};
  `}
`

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
