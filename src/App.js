import React from 'react'
import { ConnectedRouter } from 'connected-react-router'
import Routes from './Routes'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.props.history.listen(() => {
      window.scrollTo(0, 0)
    })
  }
  componentWillMount() {
    window.scrollTo(0, 0)
  }
  render () {
    return (
      <ConnectedRouter history={this.props.history}>
        <Routes />
      </ConnectedRouter>
    )
  }
}

export default App
