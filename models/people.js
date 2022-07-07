const bookshelf = require('../bookshelf')
const People = bookshelf.Model.extend({
    tableName: 'people',
    visible: ['id', 'name'],
  });

  module.exports = bookshelf.model('People', People);