// RESIZE DATA
function resizeData (resize_state) {
  return {
    type: 'RESIZE_STATE',
    resize_state
  }
}

const setResizeState = () => {
  return (dispatch) => {
    dispatch(resizeData({
      window_width: window.innerWidth,
      window_height: window.innerHeight
    }))
  }
}

// EXPORTS
export {
  setResizeState
}
