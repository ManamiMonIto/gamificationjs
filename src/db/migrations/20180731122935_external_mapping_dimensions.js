exports.up = function(knex, Promise) {
  return knex.schema.alterTable('dimensions', function(table) {
    table.text('external_src');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable('dimensions', function(table) {
      table.dropColumn('external_src');
    });
};
