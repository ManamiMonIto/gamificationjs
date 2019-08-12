exports.up = function(knex) {
  return knex.schema.alterTable('goals', function(table) {
    table.string('reward_badge').defaultTo('');
  })
  .alterTable('goals', function(table) {
    table.string('reward_title').defaultTo('');
  })
  .alterTable('goals', function(table) {
    table.text('reward_description').defaultTo('');
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('goals', function(table) {
    table.dropColumn('reward_badge');
    table.dropColumn('reward_title');
    table.dropColumn('reward_description');
  });
};
