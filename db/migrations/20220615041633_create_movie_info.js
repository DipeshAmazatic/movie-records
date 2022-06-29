/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return new Promise(async (resolve, reject) => {
        try {
          await knex.schema.createTable('genre', (table) => {
            table.increments();
            table.string('name').unique().notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
            table.timestamp('updated_at').defaultTo(knex.fn.now());
          });
          
          await knex.schema.createTable('movie', (table) => {
              table.increments();
              table.string('title').notNullable();
              table.string('lang').notNullable();
              table.time('duration');
              table.boolean('is_delete').defaultTo(false);
              table.date('release_date').defaultTo(knex.fn.now());
              table.timestamp('created_at').defaultTo(knex.fn.now());
              table.timestamp('updated_at').defaultTo(knex.fn.now());
              table.integer('genre_id').references('id').inTable('genre');
        });
          await knex.schema.createTable('people', (table) => {
              table.increments();
              table.string('name').unique().notNullable();
              table.timestamp('created_at').defaultTo(knex.fn.now());
              table.timestamp('updated_at').defaultTo(knex.fn.now());
          });
    
          await knex.schema.createTable('movie_actor', (table) => {
              table.increments();
              table.integer('actor_id').references('id').inTable('people');
              table.integer('movie_id').references('id').inTable('movie');
              table.timestamp('created_at').defaultTo(knex.fn.now());
              table.timestamp('updated_at').defaultTo(knex.fn.now());
            });
    
            await knex.schema.createTable('movie_director', (table) => {
              table.increments();
              table.integer('director_id').references('id').inTable('people');
              table.integer('movie_id').references('id').inTable('movie');
              table.timestamp('created_at').defaultTo(knex.fn.now());
              table.timestamp('updated_at').defaultTo(knex.fn.now());
            });
        resolve();
      }
      catch(error){
        reject(error);
      }
    })
    
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return new Promise(async (resolve, reject) => {
        try {
          await knex.schema.dropTable('movie_actor');
          await knex.schema.dropTable('movie_director');
          await knex.schema.dropTable('movie');
          await knex.schema.dropTable('people');
          await knex.schema.dropTable('genre');
          resolve();
        }
        catch(error){
          reject(error);
      }
    })
};
