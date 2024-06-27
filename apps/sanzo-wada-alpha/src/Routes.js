import React from 'react'
import { Route } from 'react-router'
import Document from './Document'
import { Landing, Swatch, Combination, About } from './views'

export default function () {
  return (
    <Document>
      <Route exact path={'/'} component={Landing}/>
      <Route exact path={'/about'} component={About}/>
      <Route exact path={'/swatch/:slug'} component={props => <Swatch {...props}/>}/>
      <Route exact path={'/combination/:slug'} component={props => <Combination {...props}/>}/>
    </Document>
  )
}
