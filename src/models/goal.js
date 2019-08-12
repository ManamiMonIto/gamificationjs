'use strict';

require('./dimension');
require('./goalsdimensions');
const bookshelf = require('../db');

const Goal = bookshelf.Model.extend({
  tableName: 'goals',
  hasTimestamps: true,
  // visible: ['',],

  dimensions: function() {
    return this.belongsToMany('Dimension', 'dimensions_goals', 'goal_id', 'dimension_id');
  },

  dimensions_goals: function() {
    return this.belongsTo('GoalsDimensions');
  },
}, {
  findAll: function (filter, options) {
    return this.forge().where(filter).fetchAll(options);
  },

  findOne: function (query, options) {
    return this.forge(query).fetch(options);
  },

  create: function (data, options) {
    return this.forge(data).save(null, options);
  },

  getById: function (id) {
    return this.forge().query({ where: { id } }).fetch();
  },
});

module.exports = bookshelf.model('Goal', Goal);
