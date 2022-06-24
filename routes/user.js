const express = require('express');
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { validateUser } = require('./validator');
const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    knex.select('id', 'name', 'email', 'phone_no', 'is_admin', 'is_delete', 'created_at', 'updated_at')
    .where({is_delete: false})
    .from('user')
    .then((user)=> res.send(user))
})

router.get('/:id',  (req, res) =>{
    knex.select('id', 'name', 'email', 'phone_no', 'is_admin', 'is_delete', 'created_at', 'updated_at')
    .from('user')
    .where({id: parseInt(req.params.id), is_delete: false})
    .then((user)=> {
        if(user.length == 0)
            return res.status(404).send('The user with the given ID was not found.');
        return res.send(user)
    })
})

router.post('/',  async(req, res) =>{
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex.select().from('user').where({email: req.body.email}).orWhere({phone_no: req.body.phone_no})
        .then((user) => {
            if(user && user.length > 0) return res.status(400).send('User Already registered...');
        })
    const salt =await bcrypt.genSalt(15);
    password =await bcrypt.hash(req.body.password, salt);
    knex('user')
        .insert({
            name: req.body.name,
            email: req.body.email,
            phone_no: req.body.phone_no,
            password: password,
            is_admin: req.body.is_admin || false
        })
        .then(() =>{
            knex.select().from('user').where({email: req.body.email})
                .then((user)=> {
                    // res.header('x-auth-token', token).send(user)
                    res.send(user);
                })
    })
})

router.patch('/:id', auth, admin, (req, res) =>{
    knex('user')
    .where({id: req.params.id})
    .then((user)=> {
        if(user.length == 0)
            return res.status(404).send('The user with the given ID was not found.');
    })

    knex('user')
        .where({id: req.params.id})
        .update({
            name: req.body.name || user[0].name,
            //updated_at : 
        })
        .then(() => res.status(201).send('Updated successfully...'))
})

router.delete('/:id', auth, admin, (req, res) => {
    knex('user')
        .where({id: req.params.id})
        .then((user)=> {
            if(user.length == 0)
                return res.status(404).send('The user with the given ID was not found.');
        })
    knex('user')
        .where({id: req.params.id})
        .update({
            is_delete: true
        })
        .then(() => res.status(200).send('Deleted successfully...'))
  });

module.exports = router;