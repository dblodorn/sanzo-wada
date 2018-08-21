export function resizeState(state = {}, action) {
  switch (action.type) {
    case 'RESIZE_STATE':
      return action.resize_state
    default:
      return state
  }
}

export function fontState(state = false, action) {
  switch (action.type) {
    case 'FONTS_LOADED':
      return action.bool
    default:
      return state
  }
}
