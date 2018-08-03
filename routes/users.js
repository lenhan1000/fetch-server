var express = require('express');
var User = require("../models/User");
var config = require('../config/database');
var router = express.Router();
var jwt = require('jsonwebtoken');

module.exports = passport => {
  //GET ALL USERS
  router.get('/', (req, res, next) => {
    User.find()
      .then(users => res.json(users))
      .catch(next)
  });

  //GET USER BY ID
  router.get('/:id', (req, res, next) => {
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
  router.put('/:id', (req, res, next) => {
    User.findByIdAndUpdate(req.params.id, req.body)
      .then(user => res.json(user))
      .catch(next)
  });

  //DELETE A USER
  router.delete('/:id', (req, res, next) => {
    User.findByIdAndRemove(req.params.id, req.body)
      .then(user => res.json(user))
      .catch(next)
  });

  //LOGIN WITH EMAIL AND PASSWORD
  router.post('/login', (req, res, next) => {
    let user = null;
    let bool = null;
    if (!req.body.email || !req.body.password)
      return res.send({success: false, msg: 'Please pass username and password.'})
    User.findOne({'local.email':req.body.email})
    .then(result => {
      user = result;
    })
    .catch(next)
    .then(()=>
    if (!user){
      res.send({success: false, msg: 'Authentication failed. User not found.'})
      return;
    }
    )
    var bool = user.verifyPassword(req.body.password).catch(next)
    if (!bool)
      return res.status(401).json({success: false, msg: 'Authentication failed. Wrong password.'})
    jwt.sign(user.toJSON(), config.secret, {expiresIn: "10h"}))
    .then(token => res.json({success: true, token: 'JWT ' + token}))
    .catch(next)
  })
    //   if(!user) {
    //     res.json({success: false, msg: 'Authentication failed. User not found.'});
    //   }else{
    //     user.verifyPassword(req.body.password)
    //     .then(bool => {
    //       if (bool){
    //         var token = jwt.sign(user.toJSON(), config.secret, {expiresIn: "10h"});
    //         res.json({success: true, token: 'JWT ' + token});
    //       }else{
    //         res.status(401).send({success: false, msg: 'Authentication failed. Wrong password.'})
    //       };
    //     }).catch(next)
    //   }
    // }).catch(next)
  // }
  // });

  //LOG OUT
  router.get('/logout', function(req, res){
    console.log(req)
    req.logout();
  });

  return router;
}
