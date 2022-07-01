const express = require('express');
const knex = require('../db/knex');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { validateGenrePeople } = require('./validator')

const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    knex('people').select()
    .then((people)=> res.status(200).send(people))
    .catch((error) => res.status(400).json(error));
})

router.post('/', auth, admin, (req, res) => {
    const { error } = validateGenrePeople(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex('people')
    .returning('*')
    .insert({name: req.body.name})
    .then((name) =>{
        return res.status(201).send(name)
    })
    .catch((error) => res.status(400).json("Check People or Already register this People!"));
})

module.exports = router;