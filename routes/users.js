var express = require('express');
var User = require("../models/User.js");
var router = express.Router();

//GET ALL USERS
router.get('/', (req, res, next) => {
  User.find()
  .then(users => res.json(users))
  .catch(next)
});

//GET USER BY ID
router.get('/:id', (req, res, next) => {
  User.findById(req.params.id)
  .then(user => res.json(user))
  .catch(next)
});

//CREATE A USER
router.post('/', (req, res, next) => {
  User.create(req.body)
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

module.exports = router;
