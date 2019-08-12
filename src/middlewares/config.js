'use strict'

const config = require('../config')

async function configMiddleware(ctx, next) {
  ctx.config = config
  await next()
}

module.exports = configMiddleware