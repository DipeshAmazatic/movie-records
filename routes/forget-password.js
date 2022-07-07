const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const router = express.Router();

router.post('/',  async(req, res) =>{
    try {
        const schema = Joi.object({ email: Joi.string().email().required(),
                password: Joi.string().required(), cPassword: Joi.string().required() });
        
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        if(req.body.password == req.body.cPassword)
        {
            knex('user')
            .where({email: req.body.email})
            .select('id', 'password')
            .then(async(user) => {
                if(user.length==0)
                    return res.status(400).send("user with given email doesn't exist");
                const salt =await bcrypt.genSalt(15);
                password =await bcrypt.hash(req.body.password, salt);
                knex('user').update({password: password}).where({id: user[0].id})
                .then(() =>{return res.status(200).send('Password Updated..')})
                .catch((error) =>{return res.status(400).send(error)})
            })
            .catch((error) => res.status(400).json(error));
        }else
            return res.status(400).send('Password not Match!!');

    } 
    catch (error) {res.send("An error occured")}
})

module.exports = router;