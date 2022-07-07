const bookshelf = require('../bookshelf')
require('./people');
const Movie = bookshelf.Model.extend({
    tableName: 'movie',
    actor: function(){
        return this.belongsToMany('People', 'movie_actor', 'movie_id', 'actor_id')
    },
    diractor: function() {
      return this.belongsToMany('People', 'movie_director', 'movie_id', 'director_id')
    },
    hidden: ['created_at', 'updated_at', 'genre_id', 'release_date', 'is_delete', 'movie_id']
})

module.exports = bookshelf.model('Movie', Movie);
