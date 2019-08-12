'use strict'

const Exception = require('../utils/exception')

const getByOwnerId = async (ctx, next) => {
  if (!ctx.params.ownerId) {
    throw new Exception(401, 'Invalid parameters')
  }

  try {
    ctx.params.ownerId = parseInt(ctx.params.ownerId)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const userModel = await ctx.models.User
    .forge({ owner_id: ctx.params.ownerId })
    .fetch()

  const user = userModel.toJSON()

  await next()
  ctx.body = {
    ...user,
    achievements: JSON.parse(user.achievements)
  }
}

module.exports = {
  getByOwnerId
}
