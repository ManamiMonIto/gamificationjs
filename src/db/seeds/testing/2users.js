const bcrypt = require('bcryptjs');

exports.seed = function (knex, Promise) {
  // NOTE: .del() will drop all entries, but also
  // .increment('id') will increment the 'id' each time
  // you run `knex seed:run`
  return knex('users').del()
    .then(() => {
      const salt = bcrypt.genSaltSync();
      // const hash1 = bcrypt.hashSync('lily', salt);

      //return Promise.join(
        return knex('users').insert({
          // NOTE: uuid by RFC4122 is in the models
          firstname: 'Lily',
          lastname: 'Craig',
          achievements: '{}',
          level_id: 1,
          owner_id: 1,
          // password_digest: hash1,
        })
        // TODO: move all data to mock JSON files
        .then(knex('users').insert([
          {
            firstname: 'Lawrence',
            lastname: 'Boyd',
            achievements: '{}',
            level_id: 1,
            owner_id: 2,
          },
          {
            firstname: 'Francis',
            lastname: 'Perry',
            achievements: '{}',
            level_id: 1,
            owner_id: 3,
          },
          {
            firstname: 'Brett',
            lastname: 'Pearson',
            achievements: '{}',
            level_id: 1,
            owner_id: 4,
          },
          {
            firstname: 'Gertrude',
            lastname: 'Mcguire',
            achievements: '{}',
            level_id: 1,
            owner_id: 5,
          },
          {
            firstname: 'Alta',
            lastname: 'Rodriquez',
            achievements: '{}',
            level_id: 1,
            owner_id: 6,
          },
          {
            firstname: 'Gilbert',
            lastname: 'Kelley',
            achievements: '{}',
            level_id: 1,
            owner_id: 7,
          },
        ])
        )
        // or join promises:
        // knex('users').insert({
        //   email: '',
        //   password_digest: hash,
        // }),
      
    });
};
