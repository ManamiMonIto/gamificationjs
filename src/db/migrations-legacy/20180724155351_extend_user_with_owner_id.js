exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.unique('owner_id');
    table.integer('owner_id'); // .notNullable();
  })
  .alterTable('score_events', function(table) {
    table.integer('owner_id'); // .notNullable();
  })
  .alterTable('dimensions_users', function(table) {
    table.integer('owner_id'); // .notNullable();
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('owner_id');
  })
  .alterTable('score_events', function(table) {
    table.dropColumn('owner_id');
  })
  .alterTable('dimensions_users', function(table) {
    table.dropColumn('owner_id');
  });
};
