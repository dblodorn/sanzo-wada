import React from 'react'
import { ConnectedRouter } from 'connected-react-router'
import Routes from './Routes'

const App = ({ history }) => {
  return (
    <ConnectedRouter history={history}>
      <Routes/>
    </ConnectedRouter>
  )
}

export default App
