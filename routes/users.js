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
  router.put('/:id', passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    await User.findByIdAndUpdate(req.params.id, req.body)
      .then(user => res.json(user))
      .catch(next)
  });

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
      user.removePassword();
      let token = await user.sign(config.secret)
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
