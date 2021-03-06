import React from 'react'
import ReactDOM from 'react-dom'
import { createBrowserHistory } from 'history'
import { routerMiddleware, connectRouter } from 'connected-react-router'
import { createStore, compose, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import WebFont from 'webfontloader'
import throttle from 'lodash/throttle'
import mixin from 'lodash/mixin'
import _ from 'lodash/wrapperLodash'

import rootReducer from './state/reducers'
import { setResizeState, fontsLoaded, colorData } from './state/actions'
import App from './App'

mixin(_, {
  throttle: throttle
})

// ROUTER & REDUX
const history = createBrowserHistory()

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(
  connectRouter(history)(rootReducer),
  composeEnhancer(
    applyMiddleware(
      routerMiddleware(history),
      thunk
    ),
  ),
)

// INITIALIZE
const resizeHandler = () => {
  store.dispatch(setResizeState())
}

// Load Fonts
WebFont.load({
  custom: {
    families: ['fff-regular', 'fff-italic'],
    urls: ['/assets/fonts.css']
  },
  active: () => {
    store.dispatch(fontsLoaded(true))
  }
})
store.dispatch(colorData())
resizeHandler()
// ADD EVENT LISTENERS
window.addEventListener('resize', _.throttle(resizeHandler, 50))

ReactDOM.render(
  <Provider store={store}>
    <App history={history} />
  </Provider>,
  document.getElementById('root')
)

module.hot.accept();