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
})

router.get('/:id', auth, admin, (req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex.select()
    .from('movie')
    .where({id: req.params.id, is_delete: false})
    .then((movie)=> {
        if(movie.length == 0)
            return res.status(404).send('The movie with the given ID was not found.');
        return res.status(200).send(movie)
    })
    .catch((error) => res.status(400).json(error));
})

router.post('/', (req, res) => {
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