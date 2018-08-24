import React, { Component } from 'react'
import { connect } from 'react-redux'
import find from 'lodash/find'
import mixin from 'lodash/mixin'
import _ from 'lodash/wrapperLodash'

mixin(_, {
  find: find
})

const returnSlug = (route) => {
  const splitRoute = route.split('/')
  const splitLength = splitRoute.length - 1
  return splitRoute[splitLength]
}

const filterSwatchData = (data, pageSlug) => {
  const swatch = _.find(data, {slug: pageSlug})
  console.log(swatch)
  return swatch
}

export default (InnerComponent) => {
  class SwatchWrapper extends Component {
    constructor(props){
      super(props)
      this.state = {
        swatch: null
      }
    }
    componentWillMount(){
      this.setState({
        swatch: filterSwatchData(this.props.swatches, this.props.slug)
      })
    }
    render(){
      return (
        <InnerComponent
          {...this.state.swatch}
        />
      )
    }
  }
  return connect(
    state => ({
      swatches: state.color_data.color_list_flat,
      slug: returnSlug(state.router.location.pathname)
    })
  )(SwatchWrapper)
}
