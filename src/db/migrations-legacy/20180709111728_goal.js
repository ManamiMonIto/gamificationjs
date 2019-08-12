exports.up = function(knex) {
  return knex.schema.createTable('goals', function(table) {
    table.increments('id');
    table.timestamps(true, true);
    table.text('description').notNullable();
    table.text('score').notNullable().defaultsTo('{}');
  })
  .createTable('dimensions_goals', function(table) {
    table.increments('id');
    table.unique(['goal_id', 'dimension_id']);
    table.integer('goal_id').notNullable().references('goals.id').onDelete('cascade');
    table.integer('dimension_id').notNullable().references('dimensions.id').onDelete('cascade');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTable('dimensions_goals')
    .dropTable('goals');
};