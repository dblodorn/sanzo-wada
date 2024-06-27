const colorState = (state = {}, action) => {
  switch (action.type) {
    case 'COLOR_ARRAY':
      return action.color_data
    default:
      return state
  }
}

export default colorState