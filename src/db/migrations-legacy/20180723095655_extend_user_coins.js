exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.integer('coins').notNullable().defaultTo(0);
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('coins');
  });
};
