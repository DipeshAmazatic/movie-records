const express = require('express');
var moment = require("moment")
require("moment-duration-format");
const knex = require('../db/knex');
const { validateMovie, validateId } = require('./validator')
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/',  (req, res) =>{
    knex.select('id', 'title', 'release_date', 'duration')
    .where({is_delete: false})
    .from('movie')
    .then((movie)=> res.status(200).send(movie))
    .catch((error) => res.status(400).send(error))
    // knex('movie')
    // //.column('movie_actor.actor_id')
    // .select('movie.id', 'title', 'lang', 'duration', {name:'name',Actor_id:'people.id'})
    // //.pluck('name')
    // .innerJoin('movie_actor', 'movie.id', 'movie_actor.movie_id')
    // .innerJoin('people', 'people.id', 'movie_actor.actor_id')
    // //.where('movie.id', req.params.id)
    // //.raw('select movie.id,title,name from movie,movie_actor,people,movie_director where movie.id=? and (movie.id=movie_actor.movie_id and movie_actor.actor_id=people.id) and (movie.id=movie_director.movie_id and movie_director.director_id=people.id);',req.params.id)
    // // .where({id: req.params.id, is_delete: false})
    // .then((movies)=> {
    //     console.log("movie : ",movies);
    //     if(movies.length == 0)
    //         return res.status(404).send('The movie with the given ID was not found.');
    //     return res.status(200).send(movies)
    // })
    // .catch((error) => res.status(400).json(error));
})

router.get('/:id', auth, admin, (req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex('movie')
    .select('movie.id', 'title', 'lang', 'duration', 'name as Actor', 'people.id as Actor_id')
    .innerJoin('movie_actor', 'movie.id', 'movie_actor.movie_id')
    .innerJoin('people', 'people.id', 'movie_actor.actor_id')
    .where('movie.id', req.params.id)
    .then((movies)=> {
        if(movies.length == 0)
            return res.status(404).send('The movie with the given ID was not found.');
        const movie_info = [];
        const movie = {'id': movies[0].id, 'title': movies[0].title, 'lang': movies[0].lang, 'duration': movies[0].duration}
        movies.forEach((movieData) =>movie_info.push({'id':movieData.Actor_id, 'name':movieData.Actor}))
        movie['Actor'] = movie_info;
        knex('movie').column('name as Director', 'people.id as Director_id')
        .innerJoin('movie_director' ,'movie_director.movie_id', 'movie.id')
        .innerJoin('people' ,'movie_director.director_id', 'people.id')
        .where('movie.id', req.params.id)
        .then((peoples)=>{
            const director_info = [];
            peoples.forEach((people) =>director_info.push({'id': people.Director_id,'name': people.Director}))
            movie['Director'] = director_info;
            return res.status(200).send(movie)
        })
        .catch((error) => res.status(400).json(error));
    })
    .catch((error) => res.status(400).json(error));
})

router.post('/', auth, admin, (req, res) => {
    const { error } = validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex.transaction((trx) =>{
        knex('movie')
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
            return knex('movie_director').insert({movie_id:movie_id, director_id:req.body.director_id}).transacting(trx)
            .then(() => {return knex('movie_actor').insert({movie_id:movie_id, actor_id:req.body.actor_id}).transacting(trx)})
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
            is_delete: true
        })
        .then((movie) => {
            if(!movie)
                return res.status(404).send('The movie with the given ID was not found.');
            return res.status(200).send('Deleted successfully...')
        })
        .catch((error) => res.status(400).json(error));
  });

router.patch('/:id',  (req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex('movie')
        .where({id: req.params.id})
        .update({
            name: req.body.name //|| user[0].name,
            //updated_at : 
        })
        .then((movie) => {
            if(!movie)
                return res.status(404).send('The movie with the given ID was not found.');
            res.status(200).send('Updated successfully...')
        })
        .catch((error) => res.status(400).json(error));
})

module.exports = router;