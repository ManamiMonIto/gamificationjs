'use strict'

const get = require('lodash/get')
const Exception = require('../utils/exception')
const {
  mapScoresToLadder,
  getCoinsFromAchievements
} = require('../mappers')
const {
  queryLadder,
  queryLadderByDimensionName
} = require('../db/queries')

/** TODO:
 * save totalScore on each new changes for a user instead of functional !
 **/
const index = async (ctx, next) => {
  const totalScoreCounter = await ctx.models.Progress
    .collection()
    .query(knex => queryLadderByDimensionName(knex, 'Planets conquered'))
    .fetch()
  const totalScoreC = totalScoreCounter.toJSON()

  const allUsersModel = await ctx.models.User
    .forge()
    .fetchAll()
  const allUsers = allUsersModel.toJSON()

  const result = allUsers.map(u => ({
    id: u.id,
    firstname: u.firstname,
    lastname: u.lastname,
    totalScore: get(totalScoreC.find(t => t.user_id === u.id), 'score', 0) +
      getCoinsFromAchievements(Object.values(u.achievements))
  }))

  await next()
  /** NOTE:
   * Instead of using simple .slice(0, 5) to take Top 5 users in rating, try
   * pick nearest upper 5 from current user total score.
   */
  ctx.status = 200
  ctx.body = result.sort((a, b) => b.totalScore - a.totalScore) // mapScoresToLadder(result)
}

const topN = async (ctx, next) => {
  try {
    ctx.params.id = parseInt(ctx.params.id)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const progressModel = await ctx.models.Progress
    .collection()
    .query(knex => queryLadder(knex))
    .fetch()

  await next()
  ctx.body = mapScoresToLadder(progressModel.toJSON()).slice(0, ctx.params.id)
  ctx.status = 200
}

const myTop = async (ctx, next) => {
  // const N = (ctx.request.body.limit && typeof ctx.request.body.limit === 'number')
  //   ? parseInt(ctx.request.body.limit)
  //   : 5

  try {
    ctx.params.ownerId = parseInt(ctx.params.ownerId)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const progressModel = await ctx.models.Progress
    .collection()
    .query(knex => queryLadder(knex))
    .fetch()

  await next()

  const res = mapScoresToLadder(progressModel.toJSON())

  /**
   * NOTE:
   * Get the index of my current position overall, then get +4 above me.
   * If I'm in top 5 - return top 5.
   */
  const i = res.findIndex(r => r.owner_id === ctx.params.ownerId)

  ctx.status = 200
  ctx.body = i > 3
    ? res.slice(i - 4, i + 1)
    : res.slice(0, 5)
}

module.exports = {
  index,
  topN,
  myTop
}
