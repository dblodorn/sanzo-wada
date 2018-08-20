export function resizeState(state = {}, action) {
  switch (action.type) {
    case 'RESIZE_STATE':
      return action.resize_state
    default:
      return state
  }
}
