const express = require('express');
const knex = require('../db/knex');
const { validateMovie } = require('./validator')
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    knex.select()
    .where({is_delete: false})
    .from('movie')
    .then((movie)=> res.send(movie))
})

router.get('/:id', auth, admin, (req, res) =>{
    knex.select()
    .from('movie')
    .where({id: parseInt(req.params.id), is_delete: false})
    .then((movie)=> {
        if(movie.length == 0)
            return res.status(404).send('The movie with the given ID was not found.');
        return res.send(movie)
    })
})

router.post('/', auth,admin, (req, res) => {
    const { error } = validateMovie(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex('movie')
        .insert({
            title: req.body.title,
            lang: req.body.lang,
            duration: req.body.duration,
            release_date: req.body.release_date
        })
        .then(() =>{
            knex.select().from('movie')
                .then((movie)=> res.send(movie))
    })
})

router.delete('/:id', auth, admin, (req, res) => {
    knex('movie')
        .where({id: req.params.id, is_delete: false})
        .then((movie)=> {
            if(movie.length == 0)
                return res.status(404).send('The movie with the given ID was not found.');
        })
    knex('movie')
        .where({id: req.params.id})
        .update({
            is_delete: true
        })
        .then(() => res.status(200).send('Deleted successfully...'))
  });

  router.patch('/:id',  (req, res) =>{
    knex('movie')
    .where({id: req.params.id})
    .then((movie)=> {
        if(movie.length == 0)
            return res.status(404).send('The user with the given ID was not found.');
    })

    knex('movie')
        .where({id: req.params.id})
        .update({
            name: req.body.name //|| user[0].name,
            //updated_at : 
        })
        .then(() => res.status(201).send('Updated successfully...'))
})

module.exports = router;