'use strict'

const bookshelf = require('../db')
const { GoalsDimensions } = require('../models')
const Exception = require('../utils/exception')
const { mapGoalsToResponse } = require('../mappers')
const { asyncForEach } = require('../utils')

const index = async (ctx, next) => {
  const goals = await ctx.models.Goal.collection().fetch({
    withRelated: ['dimensions']
  })
  await next()
  ctx.body = mapGoalsToResponse(goals.toJSON())
}

const getOneById = async (ctx, next) => {

  if (!ctx.params.id) {
    throw new Exception(401, 'Invalid parameters')
  }

  const goalModel = await _fetchValueById(ctx)

  if (!goalModel) {
    ctx.status = 404
    ctx.body = { error: 'Entry not found' }
  } else {
    const goal = goalModel.toJSON()

    await next()

    ctx.body = {
      ...goal,
      score: JSON.parse(goal.score)
    }
  }
}

const create = async (ctx, next) => {
  const {
    description,
    dimensions,
    score,
    reward_badge = '',
    reward_title = '',
    reward_description = '',
    reward_coins = 0,
  } = ctx.request.body

  if (
    !description || !score || !dimensions ||
    typeof description !== 'string' ||
    !Array.isArray(dimensions) ||
    typeof score !== 'object' ||
    (reward_badge && typeof reward_badge !== 'string') ||
    (reward_title && typeof reward_title !== 'string') ||
    (reward_description && typeof reward_description !== 'string')
  ) {
    throw new Exception(401, 'Invalid parameters')
  }

  /**
   * Deep compare keys used in payload body.score and dimensions list.
   */
  if (
    JSON.stringify(
      Object.keys(score).map(s => Number(s))
    ) !== JSON.stringify(
      dimensions.map(d => Number(d))
    )
  ) {
    throw new Exception(401, 'Invalid parameters')
  }

  /**
   * NOTE: if you want to check if it already exists, use
   *  .count().then(count => count > 0)
   */
  const goal = await ctx.models.Goal.forge({
      description,
      reward_badge,
      reward_title,
      reward_description,
      reward_coins,
      score: JSON.stringify(score)
    })
    .save()
    /** NOTE: have to fetch again tp get exact goal.id. Inefficient, but works */
    .then(async model => {
      const res = await ctx.models.Goal.forge({
        created_at: model.toJSON().created_at
      }).fetch()
      return res.toJSON()
    })

  const GoalsDimensionsExtended = bookshelf.Collection.extend({
    model: GoalsDimensions
  })

  const goalsDimensions = GoalsDimensionsExtended.forge(
    dimensions.map(d => ({
      dimension_id: d,
      goal_id: goal.id
    }))
  )

  await goalsDimensions.invokeThen('save')

  await next()
  ctx.status = 200
}

const createBatch = async (ctx, next) => {
  let data = ctx.request.body

  if (!Array.isArray(ctx.request.body)) {
    const {
      description,
      dimensions,
      score,
      reward_badge = '',
      reward_title = '',
      reward_description = '',
      reward_coins = 0,
    } = ctx.request.body

    data = [{
      description,
      dimensions,
      score,
      reward_badge,
      reward_title,
      reward_description,
      reward_coins,
    }]
  }

  const GoalsDimensionsExtended = bookshelf.Collection.extend({
    model: GoalsDimensions
  })

  await asyncForEach(data, async (g) => {
    if (
      !g.description || !g.score || !g.dimensions ||
      typeof g.description !== 'string' ||
      !Array.isArray(g.dimensions) ||
      typeof g.score !== 'object' ||
      (g.reward_badge && typeof g.reward_badge !== 'string') ||
      (g.reward_title && typeof g.reward_title !== 'string') ||
      (g.reward_description && typeof g.reward_description !== 'string')
    ) {
      throw new Exception(401, 'Invalid parameters')
    }

    /**
     * Deep compare keys used in payload body.score and dimensions list.
     */
    if (
      JSON.stringify(
        Object.keys(g.score).map(s => Number(s))
      ) !== JSON.stringify(
        g.dimensions.map(d => Number(d))
      )
    ) {
      throw new Exception(401, 'Invalid parameters')
    }

    /**
     * NOTE: if you want to check if it already exists, use
     *  .count().then(count => count > 0)
     */
    const goal = await ctx.models.Goal.forge({
        description: g.description,
        reward_badge: g.reward_badge,
        reward_title: g.reward_title,
        reward_description: g.reward_description,
        reward_coins: g.reward_coins,
        score: JSON.stringify(g.score)
      })

    const savedGoal = await goal.save()

    const res = await ctx.models.Goal.forge({
      created_at: savedGoal.toJSON().created_at
    }).fetch()

    const goalsDimensions = GoalsDimensionsExtended.forge(
      g.dimensions.map(d => ({
        dimension_id: d,
        goal_id: res.toJSON().id
      }))
    )

    await goalsDimensions.invokeThen('save')
  })

  await next()
  ctx.status = 200
}

const update = async (ctx, next) => {
  let { description } = ctx.request.body

  if (!description || typeof description !== 'string') {
    throw new Exception(401, 'Invalid parameters')
  }

  const goalModel = await _fetchValueById(ctx)
  await goalModel.save({
    description,
    'updated_at': new Date()
  })
  await next()

  ctx.status = 200
}

const destroy = async (ctx, next) => {
  if (Array.isArray(ctx.request.body)) {

    ctx.request.body.forEach(async (goalId, cb) => {
      const goalModel = await ctx.models.Goal.forge({
        id: goalId
      }).fetch()

      await goalModel.destroy()
      // TODO: then return list of deleted ?

      cb && cb()
    }, err => { console.log(err) })

  } else {

    const goal = await _fetchValueById(ctx)
    await goal.destroy()
    ctx.body = { id: parseInt(ctx.params.id) }
  }

  await next()
  ctx.status = 200
}

/** Helper function for fetching */
/** NOTE: Do not forget to parse to int is string */
/** NOTE: Do not forget the .toJSON method AFTER .save() */
const _fetchValueById = async (ctx) => {
  try {
    parseInt(ctx.params.id)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const goalModel = await ctx.models.Goal.forge({
    id: parseInt(ctx.params.id)
  }).fetch()

  return goalModel
}

module.exports = {
  index,
  getOneById,
  create,
  createBatch,
  update,
  destroy
}
