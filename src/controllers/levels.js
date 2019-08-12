'use strict'

const Exception = require('../utils/exception')
const { queryOrderByUpdatedAtDesc } = require('../db/queries')

const index = async (ctx, next) => {
  const levels = await ctx.models.Level
    .collection()
    .query(knex => queryOrderByUpdatedAtDesc(knex))
    .fetch()

  await next()
  ctx.body = levels.toJSON()
}

const getOneById = async (ctx, next) => {

  if (!ctx.params.id) {
    throw new Exception(401, 'Invalid parameters')
  }

  const level = await _fetchValueById(ctx)
  await next()
  ctx.body = level.toJSON()
}

const create = async (ctx, next) => {
  const {
    value,
    score,
    title,
    description,
    badge
  } = ctx.request.body

  validateLevelRequestBody(ctx.request.body)

  const exists = await ctx.models.Level
    .where({ value })
    .count()
    .then(count => count > 0)

  if (!exists) {
    const level = new ctx.models.Level({
      value,
      score,
      title,
      description,
      badge
    })

    await level.save()

    await next()
    ctx.status = 200
  } else {
    ctx.status = 409
    ctx.body = { error: 'entry already exists' }
  }
}

const update = async (ctx, next) => {
  const {
    value,
    score,
    title,
    description,
    badge
  } = ctx.request.body

  validateLevelRequestBody(ctx.request.body)

  const levelModel = await _fetchValueById(ctx)
  if (levelModel) {
    await levelModel.save({
      value,
      score,
      title,
      description,
      badge,
      'updated_at': new Date()
    })

    await next()
    ctx.status = 200
  } else {
    ctx.status = 404 // or 204
    ctx.body = { error: 'Entry not found' }
  }
}

const destroy = async (ctx, next) => {
  const level = await _fetchValueById(ctx)
  if (level) {
    await level.destroy()
    await next()
    ctx.status = 200
    ctx.body = { id: parseInt(ctx.params.id) }
  } else {
    ctx.status = 404
    ctx.body = { error: 'Entry not found' }
  }
}

const _fetchValueById = async (ctx) => {
  try {
    parseInt(ctx.params.id)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const levelModel = await ctx.models.Level.forge({
    id: parseInt(ctx.params.id)
  }).fetch()

  return levelModel
}

const validateLevelRequestBody = body => {
  if (!body.title ||
    typeof body.value !== 'number' ||
    typeof body.score !== 'number' ||
    typeof body.title !== 'string' ||
    typeof body.badge !== 'string' ||
    typeof body.description !== 'string'
  ) {
    throw new Exception(401, 'Invalid parameters')
  }
}

module.exports = {
  index,
  getOneById,
  create,
  update,
  destroy
}
