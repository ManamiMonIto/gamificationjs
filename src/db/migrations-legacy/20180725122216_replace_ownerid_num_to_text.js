exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.text('owner_id').alter();
  })
  .alterTable('score_events', function(table) {
    table.text('owner_id').alter();
  })
  .alterTable('dimensions_users', function(table) {
    table.text('owner_id').alter();
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.integer('owner_id').alter();
  })
  .alterTable('score_events', function(table) {
    table.integer('owner_id').alter();
  })
  .alterTable('dimensions_users', function(table) {
    table.integer('owner_id').alter();
  });
};
