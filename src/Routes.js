import React from 'react'
import { Route } from 'react-router'
import Document from './Document'
import { Landing, Swatch } from './views'

export default function () {
  return (
    <Document>
      <Route exact path={'/'} component={Landing}/>
      <Route exact path={'/swatches/:slug'} component={props => <Swatch {...props}/>}/>
    </Document>
  )
}
