import { combineReducers } from 'redux'
import { resizeState } from './r_window_data'

const rootReducer = combineReducers({
  resize_state: resizeState,
})

export default rootReducer
