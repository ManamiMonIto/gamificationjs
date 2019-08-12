'use strict';

require('./level')
const bookshelf = require('../db');

const User = bookshelf.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  // hasSecurePassword: true,
  // visible: ['id', 'email', 'uuid'],

  level: function() {
    return this.belongsTo('Level');
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

  // getByEmail: function (email) {
  //   return this.forge().query({ where: { email } }).fetch();
  // },

  getById: function (id) {
    return this.forge().query({ where: { id } }).fetch();
  },

  // getByUuid: function (uuid) {
  //   return this.forge().query({ where: { uuid } }).fetch();
  // }
});

module.exports = bookshelf.model('User', User);
