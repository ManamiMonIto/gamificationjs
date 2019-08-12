exports.seed = function (knex, Promise) {
  return knex('users').del()
    .then(() => {
      knex('levels').del()
    })
    .then(() => {
      return knex('levels').insert([
          {
            title: 'Newbie',
            value: 1,
            score: 0,
            badge: 'https://octodex.github.com/images/surftocat.png',
            description: 'became thin guess cook visitor'
          },
          {
            title: 'Citizen',
            value: 2,
            score: 10,
            badge: 'https://octodex.github.com/images/inflatocat.png',
            description: 'connected them sense dug kill'
          },
          {
            title: 'Destroyer',
            value: 3,
            score: 20,
            badge: 'https://octodex.github.com/images/jetpacktocat.png',
            description: 'cell lot column race field'
          },
          {
            title: 'Conquerer',
            value: 4,
            score: 30,
            badge: 'https://octodex.github.com/images/privateinvestocat.jpg',
            description: 'face scale notice hot outer'
          },
          {
            title: 'Dark force master',
            value: 5,
            score: 40,
            badge: 'https://octodex.github.com/images/topguntocat.png',
            description: 'wrapped fought strange tape just'
          },
        ])
    });
};