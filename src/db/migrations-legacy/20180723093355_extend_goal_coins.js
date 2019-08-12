exports.up = function(knex, Promise) {
  return knex.schema.alterTable('goals', function(table) {
    table.integer('reward_coins').notNullable().defaultTo(0);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable('goals', function(table) {
    table.dropColumn('reward_coins');
  });
};
