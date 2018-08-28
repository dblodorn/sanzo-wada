import React from 'react'
import styled from 'styled-components'
import { spacing, colors, shared } from './../styles/theme.json'
import { flexRowCenteredVert, ButtonLink, flexRow } from './../styles'

export default (props) =>
  <Header>
    <LeftInfo>
      {props.children}
    </LeftInfo>
    <ButtonLink to={'/'}>
      <span>Index</span>
    </ButtonLink>
  </Header>

// STYLES
const Header = styled.header`
  ${flexRowCenteredVert};
  padding: 0 ${spacing.single_pad};
  background-color: ${colors.white};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: ${shared.nav_height};
  z-index: 100;
  border-bottom: 1px solid ${colors.med_grey};
  color: ${colors.med_grey};
  text-align: left;
  justify-content: flex-end;
`

const LeftInfo = styled.div`
  ${flexRow};
  margin-right: auto;
  padding-top: 4px;
`
