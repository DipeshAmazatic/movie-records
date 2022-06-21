const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');
const knex = require('../db/knex');
const { validateloginCredential } = require('./validator');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { error } = validateloginCredential(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    knex.select()
        .from('user').where({email: req.body.email})
        .then(async(user) => {
            if(user.length == 0) 
                return res.status(400).send('Invalid Email or Password.');
            else
                {
                    const validPassword = await bcrypt.compare(req.body.password, user[0].password);
                    if(!validPassword) return res.status(400).send('Invalid Email or Password.');
                    const token = jwt.sign({ id: user[0]['id'], email: user[0]['email'], is_admin:user[0].is_admin }, 
                    config.get('jwtPrivateKey'), { expiresIn: "24h" });
                    return res.send(token);
                }
        })
  });
  

module.exports = router;