import capitalize from 'lodash/capitalize'
import mixin from 'lodash/mixin'
import _ from 'lodash/wrapperLodash'

mixin(_, {
  capitalize: capitalize
})

export default function(path) {
  let routeClass = ''
  let title = ''

  // Format BodyClass
  switch (path) {
    case '/':
      routeClass = 'home'
      break
    case '/about':
      routeClass = 'about'
      break
    default:
      routeClass = '404'
      break
  }

  // Format PageTitle
  switch (path) {
    case '/':
      title = 'home'
      break
    default:
      title = path.replace(/\//g,'').replace(/-/g, ' ')
  }

  return {
    routeClass,
    routeTitle: _.capitalize(title)
  }
}
