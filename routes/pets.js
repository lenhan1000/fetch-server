
var express = require('express');
var Pet = require("../models/Pet");
var User = require("../models/User")
var config = require('../config/database');
var router = express.Router();

//TO BE MODULZIED
var fs = require("fs");
var path = require("path");
var util = require("util");

//Promisify functions
const readFile = util.promisify(fs.readFile);
const parseJSON = util.promisify(JSON.parse);


module.exports = passport => {
  //GET ALL PET
  router.get('/',
  passport.authenticate('jwt', {session: false}),
  async (req, res, next) => {
    await User.findPets(
      req.headers.authorization.substring(4)
    ).then(pets => {
        if (!pets) res.json(
          {success: false, msg: "No user found"}
        )
        else res.json(
          {success: true, msg: pets}
        )
      }
    ).catch(next)
  });

  //GET ALL BREED
  router.get('/dogs/breed/all',
  passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    let jsPath = path.join(
      __dirname, "..", "res", "json", "dog_breeds.json"
    )
    await readFile(
      jsPath,"utf8"
    ).then( file =>{
      js = JSON.parse(file)
      res.json({success:true, msg: js})
    }).catch(next)
  });

  router.get('/cats/breed/all',
  passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    let jsPath = path.join(
      __dirname, "..", "res", "json", "cat_breeds.json"
    )
    await readFile(jsPath,"utf8")
    .then( file =>{
      js = JSON.parse(file)
      res.json({success:true, msg: js})
    }).catch(next)
  });

  router.post('/create',
  passport.authenticate('jwt', {session:false}),
  async (req, res, next) => {
    await User.addPet(
      req.headers.authorization.substring(4), req.body
    ).then(user =>{
      if (!user) res.json(
        {success: false, msg: "Failed to create pet"}
      )
      else res.json(
        {success: true, msg: "Successfully add pet"}
      )
    }).catch(next)
  });

  return router;
}
