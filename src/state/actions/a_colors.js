import colors from './../../colors'

function setColors (color_data) {
  return {
    type: 'COLOR_ARRAY',
    color_data
  }
}

const colorData = () => {
  return (dispatch) => {
    dispatch(setColors({
      color_list: colors(),
      color_state: null
    }))
  }
}

export default colorData