import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import { withStore, ColorSwatches, ColorTable } from './../components'
import { flexRow, StyledButton, media, ButtonHref } from './../styles'
import { colors, spacing, shared } from './../styles/theme.json'

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: false 
    }
  }

  _setTable() {
    this.setState({ table: true })

  }

  _setSwatch() {
    this.setState({ table: false })
  }

  render() {
    return (
      <Fragment>
        <StyleMenu>
          <ButtonWrapper>
            <StyledButton onClick={e => this._setSwatch(e)} className={(!this.state.table) && 'active'}>
              <span>Swatch View</span>
            </StyledButton>
            <StyledButton onClick={e => this._setTable(e)} className={(this.state.table) && 'active'}>
              <span>Table View</span>
            </StyledButton>
            <ButtonHref href="/assets/colors.json">
              <span>JSON API</span>
            </ButtonHref>
          </ButtonWrapper>
        </StyleMenu>
        {(this.state.table) 
          ? <ColorTable colorList={this.props.color_data.color_list} breakPoint={this.props.resize_state.window_width}/>
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
`

const ButtonWrapper = styled.div`
  display: flex;
  height: ${shared.nav_height};
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding: 0 ${spacing.single_pad};
  button {
    margin-right: ${spacing.single_pad};
  }
  ${media.small`
    margin: auto;
  `}
`
