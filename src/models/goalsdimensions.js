'use strict';

require('./goal')
require('./dimension')
const bookshelf = require('../db');

// NOTE: m2m "through" model
const GoalsDimensions = bookshelf.Model.extend({
  tableName: 'dimensions_goals',
  hasTimestamps: false,
  visible: ['goal_id', 'dimension_id', 'id'],

  goal: function() {
    return this.belongsTo('Goal');
  },
  dimension: function() {
    return this.belongsTo('Dimension');
  },
});

module.exports = bookshelf.model('GoalsDimensions', GoalsDimensions);
