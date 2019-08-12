'use strict';

require('./goal');
const bookshelf = require('../db');

const Dimension = bookshelf.Model.extend({
  tableName: 'dimensions',
  hasTimestamps: true,
  // visible: ['id', 'name'],

  goals: function() {
    return this.belongsToMany('Goal');
  }
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

module.exports = bookshelf.model('Dimension', Dimension);
