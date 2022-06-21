const knex = require('../db/knex');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const self = require('../middleware/self');
// const jwt = require('jsonwebtoken');
// const config = require('config');
const { validateUser } = require('./validator');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    knex.select('id', 'name', 'email', 'phone_no', 'is_admin', 'is_delete', 'created_at')
    .where({is_delete: false})
    .from('user')
    .then((user)=> res.send(user))
})

router.get('/:id', auth, self, (req, res) =>{
    if(res.mid_id == parseInt(req.params.id) || res.mid_id == true)
    {
        knex.select('id', 'name', 'email', 'phone_no', 'is_admin', 'is_delete', 'created_at')
        .from('user')
        .where({id: req.params.id, is_delete: false})
        .then((user)=> {
            if(user.length == 0)
                return res.status(404).send('The user with the given ID was not found.');
            return res.send(user)
        })
    }
    else
        return res.status(404).send('The user with the given ID is not Admin or not current user.');
})

router.post('/',   async(req, res) =>{
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex.select().from('user').where({email: req.body.email}).orWhere({phone_no: req.body.phone_no})
        .then((user) => {
            if(user && user.length > 0) return res.status(400).send('User Already registered...');
        })
    const salt = await bcrypt.genSalt(15);
    password = await bcrypt.hash(req.body.password, salt);
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
                    // const token = jwt.sign({ id: user[0]['id'], email: user[0]['email'], is_admin:user[0].is_admin }, 
                    // config.get('jwtPrivateKey'), { expiresIn: "24h" });
                    // res.header('x-auth-token', token).send(user)
                    res.send(user);
                })
    })
})

router.patch('/:id', (req, res) =>{
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

router.delete('/:id', auth, self, (req, res) => {
    if(res.mid_id == parseInt(req.params.id) || res.mid_id == true)
    {
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
    }
    else
        return res.status(404).send('This user can not deleted because not Admin or not current user.');
  });

module.exports = router;