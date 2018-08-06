var express = require('express');
var User = require("../models/User");
var config = require('../config/database');
var router = express.Router();
var jwt = require('jsonwebtoken');

module.exports = passport => {
  //GET ALL USERS
  router.get('/', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.find()
      .then(users => res.json(users))
      .catch(next)
  });

  //GET USER BY ID
  router.get('/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.findById(req.params.id)
      .then(user => {
        if (!user) res.json({success: false, msg: 'Username already exists.'})
        else res.json({success: true, msg: 'Successful created new user.'})
      })
      .catch(next)
  });

  //CREATE A USER
  router.post('/', (req, res, next) => {
    User.create(req, res, next)
      .then(user => res.json(user))
      .catch(next)
  });

  //UPDATE A USER
  router.put('/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body)
      .then(user => res.json(user))
      .catch(next)
  });

  //DELETE A USER
  router.delete('/:id', passport.authenticate('jwt', {session:false}), (req, res, next) => {
    User.findByIdAndRemove(req.params.id, req.body)
      .then(user => res.json(user))
      .catch(next)
  });

  //LOGIN WITH EMAIL AND PASSWORD
  router.post('/login', async (req, res, next) => {
    try{
      if (!req.body.email || !req.body.password)
        return res.send({success: false, msg: 'Please pass username and password.'})
      let user = await User.findOne({'local.email':req.body.email})
      if (!user)
        return res.send({success: false, msg: 'Authentication failed. User not found.'});
      let bool = await user.verifyPassword(req.body.password)
      if (!bool)
          return res.status(401).json({success: false, msg: 'Authentication failed. Wrong password.'})
      let token = await jwt.sign(user.toObject(), config.secret)
      res.json({success: true, token: 'JWT ' + token})
    }catch(err){next(err)}
  })
    // let user = null;
    // if (!req.body.email || !req.body.password)
    //   throw new Error('Please pass username and password.')
    //   // return res.send({success: false, msg: 'Please pass username and password.'})
    // User.findOne({'local.email':req.body.email})
    // .then(result => user = result)
    // .then(()=>{
    //   if (!user)
    //     throw new Error('Authentication failed. User not found.')
    //     // res.send({success: false, msg: 'Authentication failed. User not found.'});
    // })
    // .then(()=> user.verifyPassword(req.body.password))
    // .then(bool => {
    //   if (!bool)
    //     throw new Error('Authentication failed. Wrong password.')
    //     // return res.status(401).json({success: false, msg: 'Authentication failed. Wrong password.'})
    // })
    // .then(() => jwt.sign(user.toObject(), config.secret))
    // .then(token => {res.json({success: true, token: 'JWT ' + token});})
    // .catch(next)
  // })

  return router;
}
