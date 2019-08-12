'use strict'

const controllers = require('./controllers')
const router = require('koa-router')()

router.get('/', controllers.root.index)
router.get('/version', controllers.root.versionEnd)

router.get('/users', controllers.users.index)
router.get('/users/:ownerId', controllers.users.getOneByOwnerId)
router.post('/users', controllers.users.create)
// router.put('/users/:id', controllers.users.update)
// router.del('/users/:id', controllers.users.destroy)

router.get('/progress', controllers.progress.index)
// router.post('/progress', controllers.progress.create)
router.get('/progress/:ownerId', controllers.progress.getProgressByOwnerId)
// router.get('/progress/user/:id', controllers.progress.getOneByUserId)
// router.put('/progress/:id', controllers.progress.update)
// router.del('/progress/:id', controllers.progress.destroy)

router.get('/dimensions', controllers.dimensions.index)
router.post('/dimensions', controllers.dimensions.create)
router.post('/dimensions/batch', controllers.dimensions.createBatch)
router.get('/dimensions/:id', controllers.dimensions.getOneById)
router.put('/dimensions/:id', controllers.dimensions.update)
router.del('/dimensions/:id', controllers.dimensions.destroy)

router.get('/goals', controllers.goals.index)
router.post('/goals', controllers.goals.create)
router.post('/goals/batch', controllers.goals.createBatch)
router.get('/goals/:id', controllers.goals.getOneById)
router.put('/goals/:id', controllers.goals.update)
router.del('/goals/:id', controllers.goals.destroy)
router.post('/goals/destroy/batch', controllers.goals.destroy)

router.get('/levels', controllers.levels.index)
router.post('/levels', controllers.levels.create)
// router.post('/levels/batch', controllers.levels.createBatch)
router.get('/levels/:id', controllers.levels.getOneById)
router.put('/levels/:id', controllers.levels.update)
router.del('/levels/:id', controllers.levels.destroy)

// router.post('/stats', controllers.tracking.index)

/** NOTE: business logic-specific */
// update single or multiple scores for single User
router.put('/score/:ownerId', controllers.score.update)
// router.put('/score/:ownerId/mask', controllers.score.updateByMask)

// fetch all scores filtered by time restrictions for single User
router.post('/score/:ownerId/filter', controllers.score.filteredByTime)

// fetch all achievements of a single User
router.get('/achievements/:ownerId', controllers.achievements.getByOwnerId)

// fetch totalScore and level of multiple users: Top 5
router.get('/ladder', controllers.ladder.index)
// fetch totalScore and level of multiple users: Top N, N - given
router.get('/ladder/top/:id', controllers.ladder.topN)
// fetch totalScore and level of multiple users: Top 5 right above me
router.get('/ladder/me/:ownerId', controllers.ladder.myTop)
// fetch totalScore and level of multiple users: Top N right above me
router.post('/ladder/me/:ownerId', controllers.ladder.myTop)

module.exports = router
