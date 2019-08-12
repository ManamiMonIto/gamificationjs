'use strict'

const Exception = require('../utils/exception')
const {
  queryJoinUsersDimensions,
  queryJoinUsersDimensionsSingleUser,
  queryLadderByDimensionNameAndOwner
} = require('../db/queries')
const {
  getTotalScoreFromProgress,
  getCoinsFromAchievements,
  mapGoalsOverProgress
} = require('../mappers')

const index = async (ctx, next) => {
  const progress = await ctx.models.Progress
    .collection()
    .query(knex => queryJoinUsersDimensions(knex))
    .fetch()

  await next()
  ctx.body = progress.toJSON()
}

const getProgressByOwnerId = async (ctx, next) => {

  if (!ctx.params.ownerId) {
    throw new Exception(401, 'Invalid parameters')
  }

  /** NOTE: ownerId is not INT anymore */
  // try {
  //   ctx.params.ownerId = parseInt(ctx.params.ownerId)
  // } catch (error) {
  //   throw new Exception(401, 'Invalid parameters')
  // }

  const progressModel = await ctx.models.Progress
    .collection()
    .query(knex => queryJoinUsersDimensionsSingleUser(knex, ctx.params.ownerId))
    .fetch()

  let result = { progress: progressModel.toJSON() }

  if (result.progress.length > 0) {
    const dimensionsIds = result.progress.map(p => p.dimension_id)

    const dimensionModel = await ctx.models.Dimension
      .query(knex => knex.whereIn('id', dimensionsIds))
      .fetchAll({ withRelated: ['goals'] })

    const dimensions = dimensionModel.toJSON()

    let goalsIds = []
    dimensions.map(d => d.goals.map(g => { goalsIds.push(parseInt(g.id)) }))

    const goalModel = await ctx.models.Goal
      .query(knex => knex.whereIn('id', goalsIds))
      .fetchAll()

    /** NOTE:
     * Completeness is % of a Goal completed. cmputed on the fly while merging
     * two arrays of current progress and dimensions with goals.
     * Is later used to show the badges of goals and progressbar.
     * It's a very tricky mapping which might be replaced with better queries.
     **/
    result.goals = mapGoalsOverProgress(goalModel.toJSON(), result.progress)

    /** NOTE:
     * Cumulative score across all dimensions. Ideally in math therms it
     * should be a vector length. In real example it was designed to be a
     * simple sum of scores so that later any values added to the total score
     * would be intuitively interpreted as linear addition.
     *
     * TODO: ! split score and coins as "performance measurement" and "profit"
     * TODO: the formula should be flexibly defined by admin?
     * TODO: define custom Bonus dimension for manual scoring by admin?
     * TODO: move to own user.totalScore int field if too many DB requests?
     **/
    // result.totalScore = getTotalScoreFromProgress(result.progress) +
    //   getCoinsFromAchievements(result.goals.filter(g => g.completeness === 1))

    const completedGoals = result.goals.filter(g => g.completeness === 1)

    result.totalScore = getTotalScoreFromProgress(result.progress) + getCoinsFromAchievements(completedGoals)

    /** NOTE:
     * "coins" field in response is calculated on-the-fly in this case, but
     * it could be stored separately in the user.coins model or example.
     */
    // result.coins = getCoinsFromAchievements(goalModel.toJSON())
  }
  else {
    result.goals = []
    result.totalScore = 0
  }

  const userModel = await ctx.models.User
    .forge({ owner_id: ctx.params.ownerId })
    .fetch({ withRelated: ['level'] })

  if (!userModel) {
    ctx.status = 404
    ctx.body = { error: 'User not found' }
  } else {
    const {
      firstname,
      lastname,
      achievements,
      level
    } = userModel.toJSON()

    result.firstname = firstname
    result.lastname = lastname
    // NOTE: 'achievements' are stored as LONGTEXT. Use JSON.parse/stringify.
    result.achievements = JSON.parse(achievements)
    result.level = level

    const nextLevelModel = await ctx.models.Level.forge({
      value: level.value + 1
    }).fetch()

    result.nextLevel = nextLevelModel && nextLevelModel.toJSON()

    /** NOTE:
     * Get % of current level progress. Careful with the top level. If next one
     * does not exist - keep it null and set progress to 1.
     * */
    result.nextLevelScore = result.totalScore - result.level.score
    result.nextLevelProgress = nextLevelModel
      ? result.nextLevelScore / (result.nextLevel.score - result.level.score)
      : 1

    await next()
    ctx.body = result
  }
}

module.exports = {
  index,
  getProgressByOwnerId
}
