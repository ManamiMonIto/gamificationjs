'use strict'

let config = require('../config')
let knexconfig = require('../../knexfile')[config.env]
let knex = require('knex')(knexconfig)
let bookshelf = require('bookshelf')(knex)
// let securePassword = require('bookshelf-secure-password')

bookshelf.plugin('registry')
bookshelf.plugin('virtuals')
bookshelf.plugin('visibility')
// bookshelf.plugin(securePassword)

if (config.env === 'production') {
  knex.migrate.latest([knexfile])
}

module.exports = bookshelf
