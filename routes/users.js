var express = require('express');
var User = require("../models/User");
var config = require('../config/database');
var router = express.Router();

module.exports = passport => {
  //GET ALL USERS
  router.get('/', passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    await User.find()
      .then(users => res.json(users))
      .catch(next)
  });

  //GET USER INFO
  router.get('/info', passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    let info = await User.getInfo(req.headers.authorization.substring(4))
                      .catch(next);
    res.json({"success":true, "message":info})
  });

  //GET USER BY ID
  router.get('/:id', passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    await User.findById(req.params.id)
      .then(user => res.json(users))
      .catch(next)
  });

  //CREATE A USER
  router.post('/', async (req, res, next) => {
    await User.create(req.body)
    .then(user => {
      if (!user) res.json({success: false, msg: 'Username already exists.'})
      else res.json({success: true, msg: 'Successful created new user.'})
    })
    .catch(next)
  });

  //UPDATE A USER
  router.put('/update/info', passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    let id  = await User.getIdFromToken(req.headers.authorization.substring(4)).catch(next)
    await User.findByIdAndUpdate(id, {$set: {"updateAt": new Date()}}).catch(next)
    await User.findByIdAndUpdate(id, req.body)
      .then(user => res.json({success: true, msg: 'Information is updated'}))
      .catch(next)  });

  //DELETE A USER
  router.delete('/:id', passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    await User.findByIdAndRemove(req.params.id, req.body)
      .then(user => res.json(user))
      .catch(next)
  });

  //LOGIN WITH EMAIL AND PASSWORD
  router.post('/login', async (req, res, next) => {
    try{
      if (!req.body.email || !req.body.password)
        return res.send({success: false, msg: 'Please pass username and password.'})
      let user = await User.findByEmail(req.body.email);
      if (!user)
        return res.send({success: false, msg: 'Authentication failed. User not found.'});
      let bool = await user.verifyPassword(req.body.password)
      if (!bool)
          return res.status(401).json({success: false, msg: 'Authentication failed. Wrong password.'})
      let token = await user.sign(config.secret)
      res.json({success: true, token: 'JWT ' + token})
    }catch(err){next(err)}
  })

  return router;
}
