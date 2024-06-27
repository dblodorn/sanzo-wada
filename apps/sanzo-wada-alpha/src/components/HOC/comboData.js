import React, { Component } from 'react'
import { connect } from 'react-redux'
import find from 'lodash/find'
import includes from 'lodash/includes'
import mixin from 'lodash/mixin'
import _ from 'lodash/wrapperLodash'

mixin(_, {
  find: find,
  includes: includes
})

const returnSlug = (route) => {
  const splitRoute = route.split('/')
  return splitRoute[2]
}

const filterSwatchData = (swatches, pageSlug) => {
  let colorList = []
  const slugInt = parseInt(pageSlug, 10)
  swatches.forEach((e) => {
    if (_.includes(e.combinations, slugInt)) {
      const combination = {
        'hex': e.hex,
        'name': e.name,
        'slug': e.slug
      }
      colorList.push(combination)
    }
  })
  return {
    'colors': colorList
  }
}

export default (InnerComponent) => {
  class ComboWrapper extends Component {
    constructor(props){
      super(props)
      this.state = {
        swatch: null
      }
    }
    componentWillMount(){
      this.setState({
        swatch: filterSwatchData(
          this.props.swatches, 
          this.props.slug
        )
      })
    }
    render(){
      return (
        <InnerComponent
          {...this.state.swatch}
          {...this.props}
        />
      )
    }
  }
  return connect(
    state => ({
      swatches: state.color_data.color_list_flat,
      slug: returnSlug(state.router.location.pathname)
    })
  )(ComboWrapper)
}
