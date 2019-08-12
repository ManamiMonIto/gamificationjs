'use strict';

const mapUserScoreToScorecard = ({
  user: { firstname, lastname },
  score, badge, title, description, levelProgress, levelMax
}) => ({
  score, badge, firstname, lastname, title, description, levelProgress, levelMax
});

const mapGoalsToResponse = goals => goals.map(goal => ({
  ...goal,
  score: JSON.parse(goal.score),
  dimensions: goal.dimensions.map(d => ({
    id: d.id,
    created_at: d.created_at,
    updated_at: d.updated_at,
    name: d.name,
    // NOTE: let the dragons live here...
    score: JSON.parse(goal.score)[d.id] || 0
  }))
}));

/**
 * Helper function to calculate total score for each user and return
 * new array of results in desc order.
 * @param {Array[obj]} scores
 * @returns {Array[obj]}
 */
const mapScoresToLadder = (scores, users) => {
  /** NOTE: careful with big datasets! Refacter only as soon as too slow! */
  let ladder = {};

  /** NOTE: groupBy(scores, 'user_id') - watch out Big(O) complexity! */
  scores.map(p => {
    if (!ladder[p.user_id]) {
      ladder[p.user_id] = Object.assign(p, {})
    } else {
      ladder[p.user_id].score += p.score
    }

    // don't forget coins from achievements!
    // TODO: do not mix coins & score !
    // if (p.achievements && Object.values(JSON.parse(p.achievements))) {
    //   ladder[p.user_id].score += Object
    //     .values(JSON.parse(p.achievements || '{0: 0}'))
    //     .map(p => parseInt(p.reward_coins))
    //     .reduce((a, b) => a + b, 0);
    // }
  });

  if (users) {
    users.map(u => {
      if (u && u.id && ladder[u.id]) {
        ladder[u.id].score += Object
          .values(JSON.parse(u.achievements || '{0: 0}'))
          .map(p => parseInt(p.reward_coins))
          .reduce((a, b) => a + b, 0);
      }
    })
  }

  /** NOTE: sort by descending score value */
  return Object.values(ladder).sort((a, b) => b.score - a.score);
};

const getTotalScoreFromProgress = progress =>
  progress.reduce((acc, cur) => ({
    score: parseInt(acc.score) + parseInt(cur.score)
  })).score || 0;

/** NOTE: goal.reward_coins, user.coins */
const getCoinsFromAchievements = achievements =>
  achievements.reduce((acc, cur) => ({
    reward_coins: parseInt(acc.reward_coins) + parseInt(cur.reward_coins)
  })).reward_coins || 0;

const roundCompleteness = value => (value > 1 ? 1 : value);

const mapGoalsOverProgress = (goals, progress) => goals.map(g => {
  return {
    ...g,
    score: JSON.parse(g.score),
    // roundCompleteness cuts to 1 if above 1 because completeness >100% makes no sense
    completeness: roundCompleteness(

      // keys ~= dimensions ids
      Object.keys(JSON.parse(g.score))

        // find related progress.score in the update payload
        .map(d => {
          const found = progress.find(p => p.dimension_id === parseInt(d));
          return found && found.score || 0;
        })

        // ...to reduce to SUM
        .reduce((acc, cur) => parseInt(acc) + parseInt(cur))

        // ..and devide by SUM of scores in related goals
      / Object.values(JSON.parse(g.score))
        .reduce((acc, cur) => parseInt(acc) + parseInt(cur))
    )
  }
});

const mapScoreEventsToResponse = scoreEvents => {
  if (scoreEvents.length <= 0) return null;

  return {
    user: {
      ...scoreEvents[0].user,
      achievements: JSON.parse(scoreEvents[0].user.achievements)
    },
    score_diffs: scoreEvents.reduce((obj, event) => {
      const mappedEvent = {
        id: event.id,
        created_at: event.created_at,
        updated_at: event.updated_at,
        progress_id: event.progress_id,
        dimension: {
          id: event.dimension.id,
          name: event.dimension.name
        },
        score_diff: event.score_diff
      }

      if (!obj[event.dimension_id]) {
        obj[event.dimension_id] = [mappedEvent]
      } else {
        obj[event.dimension_id].push(mappedEvent)
      }

      return obj
    }, {})
  }
}

module.exports = {
  mapUserScoreToScorecard,
  mapGoalsToResponse,
  mapScoresToLadder,
  getTotalScoreFromProgress,
  getCoinsFromAchievements,
  mapGoalsOverProgress,
  roundCompleteness,
  mapScoreEventsToResponse
};
