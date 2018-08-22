import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import { withStore, ColorSwatches, ColorTable } from './../components'
import { flexRow, buttonInit, smallType } from './../styles'
import { spacing, colors } from './../styles/theme.json'

class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      table: false 
    }
  }

  _setTable(e) {
    this.setState({ table: true })

  }

  _setSwatch(e) {
    this.setState({ table: false })
  }

  render() {
    return (
      <Fragment>
        <StyleMenu>
          <StyleButton onClick={e => this._setSwatch(e)} className={(!this.state.table) && 'active'}>Swatch View</StyleButton>
          <StyleButton onClick={e => this._setTable(e)} className={(this.state.table) && 'active'}>Table View</StyleButton>
        </StyleMenu>
        {(this.state.table) 
          ? <ColorTable colorList={this.props.color_data.color_list}/>
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

const StyleButton = styled.button`
  ${buttonInit};
  ${smallType};
  color: ${colors.med_grey};
  text-transform: uppercase;
  display: flex;
  width: 50%;
  height: 4rem;
  align-items: center;
  justify-content: center;
  &:first-child {
    border-right: 1px solid ${colors.med_grey};
  }
  &.active,
  &:hover {
    text-decoration: underline;
  }
`