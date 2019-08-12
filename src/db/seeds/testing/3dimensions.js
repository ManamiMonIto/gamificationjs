exports.seed = function (knex, Promise) {
  return knex('dimensions_users').del()
    .then(() => {
      knex('dimensions').del()
    })
    .then(() => {
      return knex('dimensions').insert([
          {name: 'Planets conquered'},
          {name: 'Spaceships destroyed'},
          {name: 'Jedis captured'},
          {name: 'Dark forces collected'},
        ])
    })
    .then(() => {
      return knex('dimensions_users').insert([
          {score: 1},
          {score: 5},
          {score: 1},
          {score: 7},
          {score: 8},
          {score: 8},
          {score: 9},
          {score: 5},
          {score: 4},
          {score: 5},
          {score: 8},
          {score: 2},
          {score: 1},
          {score: 3},
        ])
        .then(() => {
          return Promise.join(
            knex('dimensions_users').update({
              user_id: 1,
              owner_id: 1,
              dimension_id: 1,
            }).where('id', 1),
            knex('dimensions_users').update({
              user_id: 2,
              owner_id: 2,
              dimension_id: 1,
            }).where('id', 2),
            knex('dimensions_users').update({
              user_id: 3,
              owner_id: 3,
              dimension_id: 1,
            }).where('id', 3),
            knex('dimensions_users').update({
              user_id: 4,
              owner_id: 4,
              dimension_id: 1,
            }).where('id', 4),
            knex('dimensions_users').update({
              user_id: 5,
              owner_id: 5,
              dimension_id: 1,
            }).where('id', 5),
            knex('dimensions_users').update({
              user_id: 6,
              owner_id: 6,
              dimension_id: 1,
            }).where('id', 6),
            knex('dimensions_users').update({
              user_id: 7,
              owner_id: 7,
              dimension_id: 1,
            }).where('id', 7),
            knex('dimensions_users').update({
              user_id: 1,
              owner_id: 1,
              dimension_id: 2,
            }).where('id', 8),
            knex('dimensions_users').update({
              user_id: 2,
              owner_id: 2,
              dimension_id: 2,
            }).where('id', 9),
            knex('dimensions_users').update({
              user_id: 3,
              owner_id: 3,
              dimension_id: 2,
            }).where('id', 10),
            knex('dimensions_users').update({
              user_id: 4,
              owner_id: 4,
              dimension_id: 2,
            }).where('id', 11),
            knex('dimensions_users').update({
              user_id: 5,
              owner_id: 5,
              dimension_id: 3,
            }).where('id', 12),
            knex('dimensions_users').update({
              user_id: 6,
              owner_id: 6,
              dimension_id: 2,
            }).where('id', 13),
            knex('dimensions_users').update({
              user_id: 7,
              owner_id: 7,
              dimension_id: 3,
            }).where('id', 14),
          );
        });
      }
    );
};