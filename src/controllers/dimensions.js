'use strict'

const Exception = require('../utils/exception')
const {
  queryOrderByUpdatedAtDesc
} = require('../db/queries')

const index = async (ctx, next) => {
  const dimensions = await ctx.models.Dimension
    .collection()
    .query(knex => queryOrderByUpdatedAtDesc(knex))
    .fetch()

  await next()
  ctx.body = dimensions.toJSON()
}

const getOneById = async (ctx, next) => {

  if (!ctx.params.id) {
    throw new Exception(401, 'Invalid parameters')
  }

  const dimension = await _fetchValueById(ctx)
  await next()
  ctx.body = dimension.toJSON()
}

const create = async (ctx, next) => {
  const { name, external_src = '' } = ctx.request.body

  if (!name || typeof name !== 'string') {
    throw new Exception(401, 'Invalid parameters')
  }

  const dimension = new ctx.models.Dimension({
    name,
    external_src
  })

  await dimension.save()
  await next()
  ctx.status = 200
  ctx.body = dimension.toJSON()
}

const createBatch = async (ctx, next) => {
  let data = ctx.request.body

  if (!Array.isArray(ctx.request.body)) {
    const { name, external_src = '' } = ctx.request.body

    if (!name || typeof name !== 'string') {
      throw new Exception(401, 'Invalid parameters')
    }

    data = [{ name, external_src }]
  }

  data.forEach(async d => {
    const dimension = new ctx.models.Dimension({
      name: d.name,
      external_src: d.external_src && d.external_src || ''
    })

    await dimension.save()
  })

  await next()
  ctx.status = 200
}

const update = async (ctx, next) => {
  let { name } = ctx.request.body

  if (!name || typeof name !== 'string') {
    throw new Exception(401, 'Invalid parameters')
  }

  const dimensionModel = await _fetchValueById(ctx)
  await dimensionModel.save({
    name,
    'updated_at': new Date()
  })
  await next()

  ctx.status = 200
}

const destroy = async (ctx, next) => {
  const dimension = await _fetchValueById(ctx)
  await dimension.destroy()
  await next()
  ctx.status = 200
  ctx.body = {
    id: parseInt(ctx.params.id)
  }
}

/** Helper function for fetching */
/** NOTE: Do not forget to parse to int is string */
/** NOTE: Do not forget the .toJSON method AFTER .save() */
const _fetchValueById = async (ctx) => {
  try {
    ctx.params.id = parseInt(ctx.params.id)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const dimensionModel = await ctx.models.Dimension.forge({
    id: parseInt(ctx.params.id)
  }).fetch()

  return dimensionModel
}

module.exports = {
  index,
  getOneById,
  create,
  createBatch,
  update,
  destroy
}
