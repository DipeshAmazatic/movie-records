const express = require('express');
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const { validateUser, validateId } = require('./validator');
const router = express.Router();

router.get('/', auth, admin, (req, res) =>{
    const page = req.query.page;
    knex.select('id', 'name', 'email', 'phone_no', 'is_admin', 'is_delete', 'created_at', 'updated_at')
    .where({is_delete: false})
    .from('user')
    .paginate({perPage:10, currentPage: page})
    .then((user)=> res.status(200).send(user))
    .catch((error) => res.status(400).json(error));
})

router.get('/:id',  (req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex.select('id', 'name', 'email', 'phone_no', 'is_admin', 'is_delete', 'created_at', 'updated_at')
    .from('user')
    .where({id: req.params.id, is_delete: false})
    .then((user)=> {
        if(user.length == 0)
            return res.status(404).send('The user with the given ID was not found.');
        return res.status(200).send(user)
    })
    .catch((error) => res.status(400).json(error));
})

// router.post('/',  async(req, res) =>{
//     const { error } = validateUser(req.body);
//     if (error) return res.status(400).send(error.details[0].message);
//     knex.select().from('user').where({email: req.body.email}).orWhere({phone_no: req.body.phone_no})
//         .then((user) => {
//             if(user && user.length > 0) return res.status(400).send('User Already registered...');
//         })
//         .catch((error) => res.status(400).json(error));
//     const salt =await bcrypt.genSalt(15);
//     password =await bcrypt.hash(req.body.password, salt);
//     knex('user')
//         .insert({
//             name: req.body.name,
//             email: req.body.email,
//             phone_no: req.body.phone_no,
//             password: password,
//             is_admin: req.body.is_admin || false
//         })
//         .then(() =>{
//             knex.select().from('user').where({email: req.body.email})
//                 .then((user)=> {
//                     return res.status(201).send(user);
//                 })
//                 .catch((error) => res.status(400).json(error));
//         })
//         .catch((error) => res.status(400).json(error));
// })

router.post('/',  async(req, res) =>{
    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex.transaction(function(trx) {
        return knex.select().from('user').transacting(trx).where({email: req.body.email}).orWhere({phone_no: req.body.phone_no})
        .then(async(user) => {
            if(user && user.length > 0) return res.status(400).send('User Already registered...');
            const salt =await bcrypt.genSalt(15);
            password =await bcrypt.hash(req.body.password, salt);
            return knex('user')
                .insert({
                    name: req.body.name,
                    email: req.body.email,
                    phone_no: req.body.phone_no,
                    password: password,
                    is_admin: req.body.is_admin || false
                })
                .then(() =>{
                    return knex.select().from('user').where({email: req.body.email})
                        .then((user)=> {
                            return res.status(201).send(user);
                        })
                        .catch((error) => res.status(400).json(error));
                })
            .then(trx.commit)
            .catch((err) => {
                trx.rollback();
                res.status(400).json(err)
            })
        })
    })
});

router.patch('/:id', auth, admin, (req, res) =>{
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex('user')
        .where({id: req.params.id})
        .update({
            name: req.body.name || user[0].name,
            //updated_at : 
        })
        .then((user) => {
            if(!user)
                return res.status(404).send('The user with the given ID was not found.');
            res.status(200).send('Updated successfully...')
        })
        .catch((error) => res.status(400).json(error));
})

router.delete('/:id', auth, admin, (req, res) => {
    if(isNaN(req.params.id))
        return res.status(404).send("Please check your Id...");
    const { error } = validateId({id: req.params.id});
    if (error) return res.status(400).send(error.details[0].message);
    knex('user')
        .where({id: req.params.id})
        .update({
            is_delete: true
        })
        .then((user) => {
            if(!user)
                return res.status(404).send('The user with the given ID was not found.');
            return res.status(200).send('Deleted successfully...')
        })
        .catch((error) => res.status(400).json(error));
  });

module.exports = router;