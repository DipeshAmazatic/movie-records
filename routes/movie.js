const express = require('express');
const moment = require("moment")
require("moment-duration-format");
const knex = require('../db/knex');
const { validateMovie, validateId, validateMovieData } = require('./validator')
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const Movie = require('../models/movie');
const router = express.Router();

router.get('/', auth, admin, async(req, res) =>{
    Movie.fetchAll({withRelated: ['actor','diractor']})
    .then((movieInfo) =>{
        if(movieInfo.length == 0)
            return res.status(404).send('Movie data is empty.');
        return res.status(200).send(movieInfo);
    })
    .catch((err)=>{return res.status(400).send(err)})
})

router.get('/:id', auth, admin, async(req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    Movie.where({id: req.params.id}).fetch({withRelated: ['actor','diractor']})
    .then((movieInfo) =>{
        return res.status(200).send(movieInfo);
    })
    .catch((err)=>{return res.status(400).json({messageType : err.message, message: 'Id or Movie data not exists.'})});
})

// router.get('/:id',  (req, res) =>{
//     if(isNaN(req.params.id))
//         return res.status(404).send("Please check your Id...");
//     const { error } = validateId({id: req.params.id});
//     if (error) return res.status(400).send(error.details[0].message);
//     knex('movie')
//     .select('movie.id', 'title', 'lang', 'duration', 'name as Actor', 'people.id as Actor_id')
//     .innerJoin('movie_actor', 'movie.id', 'movie_actor.movie_id')
//     .innerJoin('people', 'people.id', 'movie_actor.actor_id')
//     .where('movie.id', req.params.id)
//     .then((movies)=> {
//         if(movies.length == 0)
//             return res.status(404).send('The movie with the given ID was not found.');
//         const movie_info = [];
//         const movie = {'id': movies[0].id, 'title': movies[0].title, 'lang': movies[0].lang, 'duration': movies[0].duration}
//         movies.forEach((movieData) =>movie_info.push({'id':movieData.Actor_id, 'name':movieData.Actor}))
//         movie['Actor'] = movie_info;
//         knex('movie').column('name as Director', 'people.id as Director_id')
//         .innerJoin('movie_director' ,'movie_director.movie_id', 'movie.id')
//         .innerJoin('people' ,'movie_director.director_id', 'people.id')
//         .where('movie.id', req.params.id)
//         .then((peoples)=>{
//             const director_info = [];
//             peoples.forEach((people) =>director_info.push({'id': people.Director_id,'name': people.Director}))
//             movie['Director'] = director_info;
//             return res.status(200).send(movie)
//         })
//         .catch((error) => res.status(400).json(error));
//     })
//     .catch((error) => res.status(400).json(error));
// })

router.post('/', auth, admin, (req, res) => {
    const { error } = validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex.transaction((trx) =>{
        knex('movie').select()
        .returning('id')
        .insert({
            title: req.body.title,
            lang: req.body.lang,
            duration: moment.duration(req.body.duration, "minutes").format(),
            release_date: req.body.release_date,
            genre_id: req.body.genre_id,
        })
        .transacting(trx)
        .then((id) =>{
            const movie_id = id[0]['id'];
            const diractor = req.body.director_id;
            const diractor_id = [];
            diractor.forEach((id)=> diractor_id.push({movie_id:movie_id, director_id: id}))
            return knex('movie_director').insert(diractor_id).transacting(trx)
            .then(() => {
                const actor = req.body.actor_id;
                const actor_id = [];
                actor.forEach((id)=> actor_id.push({movie_id:movie_id, actor_id: id}))
                return knex('movie_actor').insert(actor_id).transacting(trx)
            })
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .then(() =>{
        res.status(201).send('New movie added...')
    })
    .catch((err) =>{
        res.status(400).json(err.detail)
    });
})

router.delete('/:id', auth, admin, (req, res) => {
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex('movie')
        .where({id: req.params.id})
        .update({
            is_delete: true,
            updated_at : new Date(Date.now()),
        })
        .then((movie) => {
            if(!movie)
                return res.status(404).send('The movie with the given ID was not found.');
            return res.status(200).send('Deleted successfully...')
        })
        .catch((error) => res.status(400).json(error));
  });

router.patch('/:id', auth, admin, (req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    const { err } = validateMovieData(req.body);
    if (err) return res.status(400).send(error.details[0].message);
    knex.transaction((trx) =>{
        knex('movie')
        .returning('id')
        .update({
            title: req.body.title,
            updated_at : new Date(Date.now()),
            duration: moment.duration(req.body.duration, "minutes").format(),
            release_date: req.body.release_date
        })
        .where({id: req.params.id})
        .transacting(trx)
        .then(() =>{return knex('movie_director').del().where({movie_id: req.params.id});})
        .then(() =>{
            const director = req.body.director;
            const director_id = [];
            director.forEach((id)=> director_id.push({movie_id: req.params.id, director_id: id}))
            return knex('movie_director').insert(director_id).transacting(trx) 
        })
        .then(() => {return knex('movie_actor').del().where({movie_id: req.params.id})})
        .then(() =>{
            const actor = req.body.actor;
            const actor_id = [];
            actor.forEach((id)=> actor_id.push({movie_id: req.params.id, actor_id: id}))
            return knex('movie_actor').insert(actor_id).transacting(trx)
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .then(() =>{
        res.status(201).send('Updated successfully...')
    })
    .catch((err) =>{
        res.status(400).json(err.detail)
    });
})

module.exports = router;