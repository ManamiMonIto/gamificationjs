exports.up = function(knex) {
  return knex.schema.createTable('levels', function(table) {
    table.increments();
    table.timestamps(true, true);
    table.integer('value').notNullable();
    table.integer('score').notNullable();
    table.string('title').notNullable();
    table.string('badge').notNullable();
    table.text('description').defaultsTo('');
  })
  .alterTable('users', function(table) {
    table.integer('level_id').references('levels.id').defaultsTo(1);
  });
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('users', function(table) {
      table.dropColumn('level_id');
    })
    .dropTableIfExists('levels');
};
