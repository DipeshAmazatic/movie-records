const express = require('express');
const knex = require('../db/knex');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { validateGenrePeople } = require('./validator')

const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    knex('genre').select()
    .then((genre)=> res.status(200).send(genre))
    .catch((error) => res.status(400).json(error));
})

router.post('/', auth, admin, (req, res) => {
    const { error } = validateGenrePeople(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex('genre')
    .returning('*')
    .insert({name: req.body.name})
    .then((name) =>{
        return res.status(201).send(name)
    })
    .catch(() => res.status(400).json("Check genre or Already register this genre!"));
})

module.exports = router;