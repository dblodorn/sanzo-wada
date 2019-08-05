import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import { withStore, ColorSwatches, ColorTable, Title } from './../components'
import { flexRow, StyledButton, media, ButtonHref, ButtonLink, flexColumn } from './../styles'
import { colors, spacing, shared, breakpoints } from './../styles/theme.json'

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: false 
    }
  }

  _setTable() { this.setState({ table: true })}

  _setSwatch() {this.setState({ table: false })}

  render() {
    return (
      <Fragment>
        <StyleMenu>
          <Title/>
          <ButtonWrapper>
            <StyledButton onClick={e => this._setSwatch(e)} className={(!this.state.table) && 'active'}>
              <span>{(this.props.resize_state.window_width >= breakpoints.desktop) ? `Swatch View` : `Swatches`}</span>
            </StyledButton>
            <StyledButton onClick={e => this._setTable(e)} className={(this.state.table) && 'active'}>
              <span>{(this.props.resize_state.window_width >= breakpoints.desktop) ? `List View` : `List`}</span>
            </StyledButton>
            <ButtonHref href="/assets/colors.json">
              <span>JSON {(this.props.resize_state.window_width >= breakpoints.desktop) && `API`}</span>
            </ButtonHref>
            <ButtonLink to={'/about'}>
              <span>ABOUT</span>
            </ButtonLink>
          </ButtonWrapper>
        </StyleMenu>
        {(this.state.table) 
          ? <ColorTable colorList={this.props.color_data.color_list_flat} breakPoint={this.props.resize_state.window_width}/>
          : <ColorSwatches colorList={this.props.color_data.color_list}/>
        }
      </Fragment>
    )
  }
}

export default withStore(Landing)

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
