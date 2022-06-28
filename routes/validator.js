const Joi = require('joi');

function validateUser(user) {
    const schema = {
      name: Joi.string().min(5).max(50).required(),
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
      phone_no: Joi.number().integer().required(),
      is_admin: Joi.boolean() || false
    };
    return Joi.validate(user, schema);
  }

function validateMovie(movie) {
    const schema = {
      title: Joi.string().min(5).max(50).required(),
      lang: Joi.string().min(5).max(10).required(),
      release_date: Joi.date().required()
    };
  
    return Joi.validate(movie, schema);
  }

function validateloginCredential(loginCredential) {
    const schema = {
      
      email: Joi.string().min(5).max(255).required().email(),
      password: Joi.string().min(5).max(255).required(),
    };

    return Joi.validate(loginCredential, schema);
}

function validateId(id) {
  const schema = {
    
    id: Joi.number().integer().required()
  };

  return Joi.validate(id, schema);
}

exports.validateUser = validateUser;
exports.validateMovie = validateMovie;
exports.validateloginCredential = validateloginCredential;
exports.validateId = validateId;
