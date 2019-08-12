exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments();
    // table.increments('id').primary();
    table.timestamps(true, true); // defaults to now
    // table.uuid('uuid').defaultsTo(knex.raw('uuid_generate_v4()'));
    // table.string('email').unique().notNullable();
    // table.string('password_digest').notNullable();
    table.string('firstname').defaultsTo('');
    table.string('lastname').defaultsTo('');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
