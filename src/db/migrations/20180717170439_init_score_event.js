exports.up = function(knex, Promise) {
  return knex.schema.createTable('score_events', function(table) {
    table.increments();
    table.timestamps(true, true);
    table.integer('progress_id').notNullable().references('dimensions_users.id');
    table.integer('user_id').notNullable().references('users.id');
    table.string('owner_id'); // .notNullable();
    table.integer('dimension_id').notNullable().references('dimensions.id');
    table.integer('score_diff').notNullable();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('score_events');
};
