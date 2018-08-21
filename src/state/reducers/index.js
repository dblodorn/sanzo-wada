import { combineReducers } from 'redux'
import { resizeState, fontState } from './r_window_data'
import colorState from './r_colors'

const rootReducer = combineReducers({
  color_data: colorState,
  resize_state: resizeState,
  fonts_loaded: fontState
})

export default rootReducer
