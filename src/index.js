import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, compose, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import throttle from 'lodash/throttle'
import mixin from 'lodash/mixin'
import _ from 'lodash/wrapperLodash'

import rootReducer from './state/reducers'
import { setResizeState } from './state/actions'
import App from './App'

mixin(_, {
  throttle: throttle
})

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  rootReducer,
  composeEnhancer(
    applyMiddleware(
      thunk
    ),
  ),
)

// INITIALIZE
const resizeHandler = () => {
  store.dispatch(setResizeState())
}

resizeHandler()
// ADD EVENT LISTENERS
window.addEventListener('resize', _.throttle(resizeHandler, 50))

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>,
  document.getElementById('root')
);

module.hot.accept();