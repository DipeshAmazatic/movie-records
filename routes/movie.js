const express = require('express');
const knex = require('../db/knex');
const { validateMovie, validateId } = require('./validator')
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    knex.select()
    .where({is_delete: false})
    .from('movie')
    .then((movie)=> res.status(200).send(movie))
    .catch((error) => res.status(400).json(error));
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
                .then((movie)=> res.status(201).send(movie))
        })
        .catch((error) => res.status(400).json(error));
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