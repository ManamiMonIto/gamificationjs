'use strict'

const app = require('./app')
const config = require('./config')

app.listen(config.port, function () {
  console.log('koa server (%s) listening on port %s', config.env, config.port)
  console.log('available at %s', config.url)
})
