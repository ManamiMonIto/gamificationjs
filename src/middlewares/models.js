'use strict'

const models = require('../models')

async function modelsMiddleware(ctx, next) {
  ctx.models = models
  await next()
}

module.exports = modelsMiddleware
