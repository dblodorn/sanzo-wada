import React from 'react'
import { connect } from 'react-redux'

export default (InnerComponent) => {
  const withStore = (state) => {
    return (
      <InnerComponent
        {...state.store}
      />
    )
  }
  return connect(
    state => ({
      store: state
    })
  )(withStore)
}
