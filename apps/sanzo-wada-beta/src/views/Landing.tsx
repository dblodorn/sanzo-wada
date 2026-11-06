'use client'

import { useState } from 'react'
import styled from 'styled-components'
import { ColorSwatches, ColorTable, Title } from './../components'
import type { Color, SwatchGroup } from './../colors'
import { useWindowSize } from './../state/WindowSize'
import { flexRow, StyledButton, media, ButtonHref, ButtonLink, flexColumn } from './../styles'
import { colors, spacing, shared, breakpoints } from './../styles/theme.json'

export default function Landing(props: {
  color_list: readonly SwatchGroup[]
  color_list_flat: readonly Color[]
}) {
  const [table, setTable] = useState(false)
  const resize_state = useWindowSize()

  return (
    <>
      <StyleMenu>
        <Title />
        <ButtonWrapper>
          <StyledButton onClick={() => setTable(false)} className={!table ? 'active' : undefined}>
            <span>{resize_state.window_width >= breakpoints.desktop ? `Swatch View` : `Swatches`}</span>
          </StyledButton>
          <StyledButton onClick={() => setTable(true)} className={table ? 'active' : undefined}>
            <span>{resize_state.window_width >= breakpoints.desktop ? `List View` : `List`}</span>
          </StyledButton>
          <ButtonHref href="/assets/colors.json">
            <span>JSON {resize_state.window_width >= breakpoints.desktop && `API`}</span>
          </ButtonHref>
          <ButtonLink href={'/about'}>
            <span>ABOUT</span>
          </ButtonLink>
        </ButtonWrapper>
      </StyleMenu>
      {table ? (
        <ColorTable colorList={props.color_list_flat} breakPoint={resize_state.window_width} />
      ) : (
        <ColorSwatches colorList={props.color_list} />
      )}
    </>
  )
}

// STYLES
const StyleMenu = styled.menu`
  ${flexRow};
  width: 100%;
  border-bottom: 1px solid ${colors.med_grey};
  position: -webkit-sticky;
  position: sticky;
  top: 0px;
  z-index: 9000;
  background-color: ${colors.white};
  ${media.small`
    ${flexColumn};
    padding: ${spacing.single_pad} 0 0;
  `}
  ${media.small`
    h1 {
      padding-left: ${spacing.single_pad};
    }
  `}
`

const ButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: ${shared.nav_height};
  margin-left: auto;
  padding-left: ${spacing.single_pad};
  button,
  a {
    margin-right: ${spacing.single_pad};
    ${media.small`
      margin-bottom: ${spacing.single_pad};
    `}
  }
  ${media.small`
    margin: auto;
    flex-wrap: wrap;
    justify-content: flex-start;
    height: auto;
    padding: ${spacing.single_pad} ${spacing.single_pad} 0;
  `}
`
