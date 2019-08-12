const queryLadder = knex => knex.select(
  'dimensions_users.user_id',
  'dimensions_users.score',
  'u.firstname',
  'u.lastname',
  'l.badge',
)
.leftJoin('users AS u', 'u.id', 'dimensions_users.user_id')
.leftJoin('levels AS l', 'l.id', 'u.level_id');

const queryLadderByDimensionName = (knex, dimensionName) => knex.select(
  'dimensions_users.user_id',
  'dimensions_users.score',
  'u.firstname',
  'u.lastname',
  'l.badge',
  // 'd.name',
)
.join('users AS u', 'u.id', '=', 'dimensions_users.user_id')
.join('levels AS l', 'l.id', '=', 'u.level_id')
.join('dimensions AS d', 'd.id', '=', 'dimensions_users.dimension_id')
.where({ 'd.name': dimensionName })

const queryLadderByDimensionNameAndOwner = (knex, ownerId, dimensionName) => knex.select(
  'dimensions_users.user_id',
  'dimensions_users.score',
  'u.firstname',
  'u.lastname',
  'l.badge',
)
.leftJoin('users AS u', 'u.id', 'dimensions_users.user_id')
.leftJoin('levels AS l', 'l.id', 'u.level_id')
.leftJoin('dimensions AS d', 'd.id', 'dimensions_users.dimension_id')
.where({ 'd.name': dimensionName })
.andWhere({ 'u.owner_id': ownerId })

const queryJoinGoalsDimensions = knex => knex.select(
  'goal_id',
  'd.name',
  'g.description',
  'g.score',
  'g.reward_badge',
  'g.reward_title',
  'g.reward_description',
)
.join('dimensions AS d', 'd.id', 'dimensions_goals.dimension_id')
.join('goals AS g', 'g.id', 'dimensions_goals.goal_id');

const queryJoinUsersDimensions = knex => knex.select(
  'dimensions_users.updated_at', // NOTE: remove ambiguity by referencing tablename
  'dimensions_users.user_id',
  'dimensions_users.dimension_id',
  'score',
  'd.name as dimension_name',
  'u.firstname as user_firstname',
  'u.lastname as user_lastname',
)
.leftJoin('users AS u', 'u.id', 'dimensions_users.user_id')
.leftJoin('dimensions AS d', 'd.id', 'dimensions_users.dimension_id');

const queryJoinUsersDimensionsSingleUser = (knex, ownerId) => knex.select(
  'dimensions_users.updated_at',
  'dimensions_users.dimension_id',
  'dimensions_users.score',
  'd.name as dimension_name',
)
.leftJoin('users AS u', 'u.id', 'dimensions_users.user_id')
.leftJoin('dimensions AS d', 'd.id', 'dimensions_users.dimension_id')
.where({ 'dimensions_users.owner_id': ownerId });

module.exports = {
  queryLadder,
  queryLadderByDimensionName,
  queryLadderByDimensionNameAndOwner,
  queryJoinGoalsDimensions,
  queryJoinUsersDimensions,
  queryJoinUsersDimensionsSingleUser
}