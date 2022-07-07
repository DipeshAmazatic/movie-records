const knex = require('./db/knex')
Bookshelf = require('bookshelf')(knex)
module.exports = Bookshelf;