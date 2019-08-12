'use strict';

const bookshelf = require('../db');

const Level = bookshelf.Model.extend({
  tableName: 'levels',
  hasTimestamps: true,
  // visible: ['id', ''],
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

module.exports = bookshelf.model('Level', Level);
