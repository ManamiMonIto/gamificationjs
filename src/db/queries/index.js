const {
  queryLadder,
  queryLadderByDimensionName,
  queryLadderByDimensionNameAndOwner,
  queryJoinGoalsDimensions,
  queryJoinUsersDimensions,
  queryJoinUsersDimensionsSingleUser
} = require('./m2mModels');

// knex.limit(50).offset(0).orderBy('created_at', 'asc');
const queryOrderByUpdatedAtDesc = knex => knex.orderBy('updated_at', 'desc');
const queryOrderByUpdatedAtAsc = knex => knex.orderBy('updated_at', 'asc');
const queryOrderByCreatedAtDesc = knex => knex.orderBy('created_at', 'desc');
const queryOrderByCreatedAtAsc = knex => knex.orderBy('created_at', 'asc');

module.exports = {
  queryOrderByUpdatedAtDesc,
  queryOrderByUpdatedAtAsc,
  queryOrderByCreatedAtDesc,
  queryOrderByCreatedAtAsc,
  queryLadder,
  queryLadderByDimensionName,
  queryLadderByDimensionNameAndOwner,
  queryJoinGoalsDimensions,
  queryJoinUsersDimensions,
  queryJoinUsersDimensionsSingleUser
}