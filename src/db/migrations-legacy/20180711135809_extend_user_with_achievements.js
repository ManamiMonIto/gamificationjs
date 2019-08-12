exports.up = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.text('achievements', 'longtext').defaultTo('{}');
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', function(table) {
    table.dropColumn('achievements');
  });
};
