const routes = require('./routes')
const apis = require('./apis')

module.exports = (app) => {
  app.use('/api', apis)
  app.use('/', routes)
}