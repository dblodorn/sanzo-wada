import React from 'react'
import styled from 'styled-components'
import { spacing, colors, shared } from './../styles/theme.json'
import { flexRowCenteredVert, ButtonLink, flexRow, flexColumn, media } from './../styles'

export default (props) =>
  <Header>
    <LeftInfo>
      {props.children}
    </LeftInfo>
    <RightSide>
      <ButtonLink to={'/'}>
        <span>Index</span>
      </ButtonLink>
    </RightSide>
  </Header>

// STYLES
const Header = styled.header`
  ${flexRowCenteredVert};
  padding: 0;
  background-color: ${colors.white};
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: ${shared.nav_height};
  z-index: 100;
  border-bottom: 1px solid ${colors.med_grey};
  color: ${colors.med_grey};
  text-align: left;
  justify-content: flex-end;
  ${media.small`
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    height: auto;
    padding: ${spacing.single_pad} 0;
  `}
`

const LeftInfo = styled.div`
  ${flexRow};
  margin-right: auto;
  padding-right: ${spacing.single_pad};
  height: 100%;
  align-items: center;
  flex: 1;
  ${media.small`
    ${flexColumn};
    padding-left: 0;
    align-items: flex-start;
    padding-top: 0;
    padding-left: ${spacing.single_pad};
  `}
`

const RightSide = styled.div`
  padding-right: ${spacing.single_pad};
  display: flex;
  align-items: center;
  height: 100%;
  ${media.small`
    height: auto;
    padding: ${spacing.single_pad} ${spacing.single_pad} 0;
  `}
`
