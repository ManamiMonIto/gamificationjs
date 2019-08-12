exports.seed = function (knex, Promise) {
  return knex('dimensions_goals').del()
    .then(() => {
      knex('goals').del()
    })
    .then(() => {
      return knex('goals').insert([
          {
            description: 'Conquer 2 planets',
            score: '{"1": "2"}',
            reward_badge: 'https://octodex.github.com/images/class-act.png',
            reward_title: 'hidden guard',
            reward_description: 'want trap direction measure hungry',
          },
          {
            description: 'Capture 5 jedis',
            score: '{"3": "5"}',
            reward_badge: 'https://octodex.github.com/images/class-act.png',
            reward_title: 'sand force declared',
            reward_description: 'capital engine suppose truck fair shout',
          },
          {
            description: 'Destroy 10 spaceships',
            score: '{"2": "10"}',
            reward_badge: 'https://octodex.github.com/images/class-act.png',
            reward_title: 'lovely feature',
            reward_description: 'flame tower led where sail introduced',
          },
          {
            description: 'Destroy 10 spaceships and Conquer 3 planets',
            score: '{"2": "10", "1": "3"}',
            reward_badge: 'https://octodex.github.com/images/class-act.png',
            reward_title: 'lovely feature',
            reward_description: 'flame tower led where sail introduced',
          },
        ])
    })
    .then(() => {
      return knex('dimensions_goals').insert([
          {
            dimension_id: 1,
            goal_id: 1,
          },
          {
            dimension_id: 3,
            goal_id: 2,
          },
          {
            dimension_id: 2,
            goal_id: 3,
          },
          {
            dimension_id: 1,
            goal_id: 4,
          },
          {
            dimension_id: 2,
            goal_id: 4,
          }
        ])
    })
    // .then(() => {
    //   return knex('dimensions_goals').insert([
    //       {value: 2},
    //       {value: 5},
    //       {value: 10}
    //     ])
    // })
    // .then(() => {
    //   return Promise.join(
    //     knex('dimensions_goals').update({
    //       dimension_id: 1,
    //       goal_id: 1,
    //     }).where('id', 1),
    //     knex('dimensions_goals').update({
    //       dimension_id: 3,
    //       goal_id: 2,
    //     }).where('id', 2),
    //     knex('dimensions_goals').update({
    //       dimension_id: 2,
    //       goal_id: 3,
    //     }).where('id', 3),
    //   );
    // });
};
