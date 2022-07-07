const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const knex = require('../db/knex');
const router = express.Router();
const auth = require('../middleware/auth');
router.post('/', auth,  async(req, res) =>{
    try {
        const schema = Joi.object({ oldPassword: Joi.string().required(),
                newPassword: Joi.string().required(), cNewPassword: Joi.string().required() });
        const { error } = schema.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        if(req.body.newPassword == req.body.cNewPassword)
        {
            const validPassword =await bcrypt.compare(req.body.oldPassword, req.user.password);
            if(!validPassword) return res.status(400).send('Invalid old Password!');
            const salt =await bcrypt.genSalt(15);
            password =await bcrypt.hash(req.body.newPassword, salt);
            knex('user').update({password: password}).where({id: req.user.id})
            .then(()=>{return res.status(200).send('Password Updated..')})
            .catch((error) => {return res.status(400).json(error)});
        }else
            return res.status(400).send('Password not Match!!');

    } 
    catch (error) {return res.send("An error occured")}
})

module.exports = router;