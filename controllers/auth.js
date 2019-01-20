const Joi = require('joi');
const HttpStatus = require('http-status-codes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Helpers = require('../Helpers/helper');
const Config = require('../config/secret');

module.exports = {
  async CreateUser(req,res){
    const schema = Joi.object().keys({
      username: Joi.string().alphanum().min(3).max(30).required(),
      userpassword: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
      useremail: Joi.string().email({ minDomainAtom:2}),
      userlanguage: Joi.string().min(1).max(25)
    });

    const {error, value} = Joi.validate(req.body, schema);
    if(error && error.details)
    {
      return res.status(HttpStatus.BAD_REQUEST).json({message: error.details});
    }

    const userEmail = await User.findOne({useremail:Helpers.lowercase(req.body.useremail)});

    if(userEmail){
      return res.status(HttpStatus.CONFLICT)
      .json({ message: 'Email already exist'});
    }

    const userName = await User.findOne({username: Helpers.Userformat(req.body.username)});

    if(userName){
      return res.status(HttpStatus.CONFLICT)
      .json({message: 'Username already exist'});
    }

    return bcrypt.hash(value.userpassword,10, (err, hash)=>{
      if(err)
      {
        return res.status(HttpStatus.BAD_REQUEST)
        .json({message: 'Error while hashing password'});
      }
      const body = {
        username : Helpers.Userformat(value.username),
        useremail: Helpers.lowercase(value.useremail),
        userlanguage:Helpers.lowercase(value.userlanguage),
        userpassword: hash
      };
      User.create(body)
      .then(user => {
        const token = jwt.sign({data:user}, Config.secret,{
          expiresIn:"4h"
        });
        res.cookie('auth',token);
        res.status(HttpStatus.CREATED)
        .json({message: 'User created successfully',user, token});
      })
      .catch(err =>{
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({message: 'Error Occured'});
      });
    });
  },

  async checkUser(req, res){
    if(!req.body.username || !req.body.userpassword){
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:'No empty feilds allowed.'});
    }
    await User.findOne({username: Helpers.Userformat(req.body.username)}).then(user=>{
      if(!user)
      {
        return res.status(HttpStatus.NOT_FOUND).json({message:'User not found.'});
      }
      return bcrypt.compare(req.body.userpassword, user.userpassword).then((result) =>{
        if(!result)
        {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:'Password is incorrect.'});
        }

        const token = jwt.sign({data: user},Config.secret,{
          expiresIn:"4h"
        });
        res.cookie('auth',token);
        return res.status(HttpStatus.OK).json({message: 'Login Successful',user, token});
      })
    })
    .catch(err =>{
      console.log(err);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:'Error Occured.'});
    })
  }
}
