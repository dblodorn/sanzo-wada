import { combineReducers } from 'redux'
import { resizeState, fontState } from './r_window_data'
import colorState from './r_colors'
// import { routeName } from './../../scripts'

const rootReducer = combineReducers({
  color_data: colorState,
  resize_state: resizeState,
  fonts_loaded: fontState,
  // router_names: 'routeName(router)'
})

export default rootReducer
