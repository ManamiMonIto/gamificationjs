'use strict';

require('./user');
require('./dimension');
require('./usersdimensions');
const bookshelf = require('../db');

const ScoreEvent = bookshelf.Model.extend({
  tableName: 'score_events',
  hasTimestamps: true,

  progress: function() {
    return this.belongsTo('Progress'); // 'UserDimensions'
  },

  user: function() {
    return this.belongsTo('User');
  },

  dimension: function() {
    return this.belongsTo('Dimension');
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

module.exports = bookshelf.model('ScoreEvent', ScoreEvent);
