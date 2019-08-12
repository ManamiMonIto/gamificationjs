'use strict';

require('./user')
require('./dimension')
const bookshelf = require('../db');

const UserDimensions = bookshelf.Model.extend({
  tableName: 'dimensions_users',
  // hasTimestamps: true,
  // visible: ['',],

  user: function() {
    return this.belongsTo('User');
  },
  dimension: function() {
    return this.belongsTo('Dimension');
  },
});

module.exports = bookshelf.model('Progress', UserDimensions);
