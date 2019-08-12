'use strict'

const {
  queryOrderByCreatedAtDesc
} = require('../db/queries')

// const config = require('../config')
const Exception = require('../utils/exception')

const index = async (ctx, next) => {
  const users = await ctx.models.User
    .collection()
    .query(knex => queryOrderByCreatedAtDesc(knex))
    .fetch()

  await next()
  ctx.body = users.toJSON()
}

const getOneByOwnerId = async (ctx, next) => {
  if (!ctx.params.ownerId) {
    throw new Exception(401, 'Invalid parameters')
  }

  // NOTE: users.owner_id - TEXT
  const userModel = await ctx.models.User.forge({
    owner_id: ctx.params.ownerId
  }).fetch()

  if (!userModel) { // not null
    ctx.status = 404
    ctx.body = { error: 'Entry not found' }
  } else {
    await next()
    ctx.body = userModel.toJSON()
  }
}

const create = async (ctx, next) => {
  let data = ctx.request.body

  if (!Array.isArray(ctx.request.body)) {
    const {
      ownerId,
      firstname,
      lastname
    } = ctx.request.body

    if (!firstname || !ownerId) {
      throw new Exception(401, 'Invalid parameters')
    }

    data = [{ ownerId, firstname, lastname }]
  }

  const levelModel = await ctx.models.Level.forge({
    value: 0
  }).fetch()
  const basicLevel = levelModel.toJSON()

  data.forEach(async entry => {
    const user = new ctx.models.User({
      owner_id: entry.ownerId,
      firstname: entry.firstname,
      lastname: entry.lastname,
      level_id: basicLevel.id,
    })

    await user.save()
  })

  await next()
  ctx.status = 200
}

module.exports = {
  index,
  getOneByOwnerId,
  create,
}
