'use strict'

const Exception = require('../utils/exception')
const {
  getTotalScoreFromProgress,
  mapScoreEventsToResponse,
  getCoinsFromAchievements
} = require('../mappers')
const {
  convertJSDateToSQLDate,
  objIsEmpty
} = require('../utils')

/** NOTE:
 * Steps of logic:
 * - Validate inputs.
 * - Get or create Progress.
 * - calculate new totalScore
 * - check if new totalScore >= any new Level -> save to user.level
 * - check if each dimansional score >= Goal.score -> save to user.achievements
 * - save user data
 */
const update = async (ctx, next) => {
  let { ownerId } = ctx.params

  if (!ctx.request.body) {
    throw new Exception(401, 'Invalid parameters')
  }

  /** NOTE: ownerId is not TEXT, not INT - to avoid "out of range" + string ids O_o */
  // try {
  //   ownerId = parseInt(ownerId)
  // } catch (error) {
  //   throw new Exception(401, 'Invalid parameters')
  // }

  /** NOTE:
   * is it an ugly patch or not ?
   **/
  const userModel = await ctx.models.User.forge({
    owner_id: ownerId
  }).fetch()

  const user = userModel.toJSON()
  const userId = user.id

  /** get or create Progress with scores */

  /**
   * TODO: IMPORTANT!
   * The hacky way to use batch upsert is described here:
   * https://github.com/bookshelf/bookshelf/issues/55#issuecomment-317231728
   */
  const progress = await Promise.all(
    Object.keys(ctx.request.body).map(async key => {

      let progressModel = await ctx.models.Progress.forge({
        dimension_id: parseInt(key),
        owner_id: ownerId
      }).fetch()

      if (progressModel === null) {

        // create if does not exist
        const progress = await ctx.models.Progress.forge({
          dimension_id: parseInt(key),
          user_id: userId,
          owner_id: ownerId,
          score: parseInt(ctx.request.body[key])
        })
        .save()
        .then(async model => {
          const res = await ctx.models.Progress.forge({
            id: model.toJSON().id
            // created_at: model.toJSON().created_at
          }).fetch()
          return res.toJSON()
        })
        .then(p => {
          const scoreEvent = new ctx.models.ScoreEvent({
            progress_id: p.id,
            user_id: userId,
            owner_id: ownerId,
            dimension_id: parseInt(key),
            score_diff: parseInt(ctx.request.body[key]),
          })

          scoreEvent.save()
          return p
        })

        return progress

      } else {

        // update
        await progressModel.save({
          score: progressModel.toJSON().score + parseInt(ctx.request.body[key]),
          updated_at: new Date()
        })
        // .then(async model => {
        //   const res = await ctx.models.Progress.forge({
        //     id: model.toJSON().id
        //     // created_at: model.toJSON().created_at
        //   }).fetch()
        //   return res.toJSON()
        // })
        .then(p => {
          const scoreEvent = new ctx.models.ScoreEvent({
            progress_id: p.toJSON().id,
            user_id: userId,
            owner_id: ownerId,
            dimension_id: parseInt(key),
            score_diff: parseInt(ctx.request.body[key]),
          })

          scoreEvent.save()

          return p.toJSON()
        })

      }

      return progressModel.toJSON()
    })
  )

  /** Check totalScore and new Level */
  /** Get all user progress to calculate totalScore */

  const progressModel = await ctx.models.Progress
    .collection()
    .query(knex => knex.where({ owner_id: ownerId }))
    .fetch()
  const totalUserProgress = progressModel.toJSON()

  const totalScore = getTotalScoreFromProgress(totalUserProgress) +
    getCoinsFromAchievements(Object.values(user.achievements))

  /** Check if user crossed new Level */

  let newlevel = false

  const levelModel = await ctx.models.Level
    .collection()
    .query(knex => knex
      .where('score', '<=', totalScore) // lte
      .orderBy('score', 'desc')
      .limit(1)
    ).fetch()
  const level = levelModel.toJSON()[0] // NOTE: careful with Level 0 !

  if (user.level_id !== level.id) {
    newlevel = Object.assign({}, level)
  } else {
    newlevel = { id: user.level_id }
  }

  /** Check if each dimansional score >= Goal.score */

  const dimensionsIds = progress.map(p => p.dimension_id)

  /** TODO:
   * Two SQL queries redundant - build complex query for single transaction.
   **/
  const goalDimensionModel = await ctx.models.GoalsDimensions
    .collection()
    .query(knex => knex
      .whereIn('dimension_id', dimensionsIds)
    )
    .fetch(/* { withRelated: ['goal'] } */)

  const goalsIds = goalDimensionModel.toJSON().map(g => g.goal_id)

  const goalModel = await ctx.models.Goal
    .collection()
    .query(knex => knex
      .whereIn('id', goalsIds)
    )
    .fetch()
  /** -- End of Braincracker #1 -- */

  /** ATTENTION! HAZARD!
   * Code smells with Gas!
   **/
  const goalsAll = goalModel.toJSON()
  const goalsParsed = goalsAll.reduce((obj, item) => {
    obj[item.id] = {
      ...item,
      score: JSON.parse(item.score)
    }
    return obj
  }, {})

  const progressKeys = totalUserProgress.reduce((obj, item) => {
    obj[item.dimension_id] = item.score
    return obj
  }, {})

  let achievements = {}
  let newAchievements = []
  const userAchievementsKeys = Object.values(
    JSON.parse(user.achievements)
  )
  .map(a => parseInt(a.id))

  Object.keys(goalsParsed).map(goalId => {

    /** The goal was scored successfully */
    if (!Object.keys(goalsParsed[goalId].score)
      .map(gkey => progressKeys[gkey] >= goalsParsed[goalId].score[gkey])
      .some(res => res === false)
    ) {
      achievements[goalId] = goalsParsed[goalId]

      // NOTE: return newAchievements to show splash screen
      // (store cookies flag for that?)
      if (!userAchievementsKeys.includes(parseInt(goalId))) {
        newAchievements.push(goalsParsed[goalId])
      }
    }

  })
  /** -- End of Braincracker #2 -- */

  /** NOTE: Update user level and achievements - if any new */
  if (newlevel.id !== user.level_id || Object.keys(achievements).length > 0) {

    await userModel.save({
      achievements: JSON.stringify({ // LONGTEXT
        ...Object.values(achievements)
      }),
      level_id: newlevel.id,
      updated_at: new Date()
    })

  }

  /** TODO: update coins here ! */

  await next()
  ctx.status = 200
  // NOTE: ctx.body == null will set status code to 204
  ctx.body = newAchievements.length === 0 ? null : { newAchievements }
}


/** -- START of update score by dimension.external_src filter mask -- */

const updateByMask = async (ctx, next) => {
  /**
   * method should operate with raw form submit data by getting all
   * fil = JSON.parse(dimension.external_src) values then to be used as:
   * _.filter([formData], fil).length > 0 --> include this dimension in the
   * list of ones to be updated. The score should be then +1 OR predefined.
   *
   * Example for the cliend-side implementation:
   *
   * const applyDimensionMask = (data, response) => {
   *   const result = {}
   *
   *   response.map(d => {
   *     if (_.filter(data, JSON.parse(d.external_src)).length > 0) {
   *       result[d.id] = 1 // NOTE: this step may be defined > 1 later
   *     }
   *   })
   *
   *   return result
   * }
   *
   * export const updateScore = (ownerId: any, data: any) => axios
   *   .get('/api/dimensions')
   *   .then(response => applyDimensionMask(data, response))
   *   .then(foo => {
   *     axios.put(`/api/score/${ownerId}`, foo)
   *       .then(response => response.data)
   *       .catch(error => { throw Error(error) })
   *   })
   *   .catch(error => { throw Error(error) })
   */
}

/** -- END of update score by dimension.external_src filter mask -- */


const filteredByTime = async (ctx, next) => {
  const { from, to } = ctx.request.body

  if (!from || !to) {
    throw new Exception(401, 'Invalid parameters')
  }

  let startTime, endTime
  try {
    startTime = convertJSDateToSQLDate(from)
    endTime = convertJSDateToSQLDate(to)
  } catch (error) {
    throw new Exception(401, 'Invalid parameters')
  }

  const scoreEventModel = await ctx.models.ScoreEvent
    .collection()
    .query(knex => knex
      /**
       * First option: use `.whereBetween('created_at', [startTime, endTime])`.
       * Second option: use custom query with joins if progress needed.
       */
      .where({ owner_id: parseInt(ctx.params.ownerId) })
      .andWhere('created_at', '>=', startTime)
      .andWhere('created_at', '<', endTime)
    )
    .fetch({
      withRelated: ['dimension', 'user', 'progress']
    })

  await next()

  const scoreEvents = scoreEventModel.toJSON()

  if (scoreEvents && scoreEvents.length > 0) {
    const result = mapScoreEventsToResponse(scoreEvents)
    ctx.status = 200
    ctx.body = result
  } else {
    ctx.status = 404
    ctx.body = { error: 'Entry not found' }
  }
}

module.exports = {
  update,
  updateByMask,
  filteredByTime
}
