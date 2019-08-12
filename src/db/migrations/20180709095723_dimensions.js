/** NOTE:
 * The dimension for the gamification model across which a user
 * may be able to move inside the space of the game states. i.e. if 2
 * dimensions like 'number of users registered' and 'number of TVs sold'
 * gathered - then a user in the space should be defined in a point
 * [{
 *   'number of users registered': 5,
 *   'number of TVs sold': 1
 * }]
 * which will define strictly his coordinates. Such models like Goal and
 * Progress will reference to given Dimensions model.
 */
exports.up = function(knex) {
  return knex.schema.createTable('dimensions', function(table) {
    table.increments();
    table.timestamps(true, true);
    table.string('name').notNullable();
  })
  .createTable('dimensions_users', function(table) {
    table.increments();
    table.timestamps(true, true);
    table.unique(['user_id', 'dimension_id']);
    table.integer('user_id').references('users.id').onDelete('cascade');
    table.integer('dimension_id').references('dimensions.id').onDelete('cascade');
    table.string('owner_id'); // .notNullable();
    table.integer('score');
  })
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('dimensions_users')
    .dropTableIfExists('dimensions');
};
