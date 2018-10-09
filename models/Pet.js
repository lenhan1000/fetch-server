var mongoose = require('mongoose');
var User = require("./User.js");
var jwt = require("jsonwebtoken");
var Schema = mongoose.Schema;
var PetSchema = new mongoose.Schema({
    info: {
      name: {type: String},
      type: {type:String},
      breed: {type: String},
      age: {type: Number},
      weight: {type: Number},
      personality: [],
      gender: {type: Boolean},
      spayed: {type: Boolean},
      birth: {type: Date},

    },
    updateAt: {type: Date, default: Date.now()},
  }, {
    toJSON:{
      transform: function(doc, ret){
        delete ret._id
        delete ret.updateAt
        ret.info.birth = ret.info.birth.getTime()
      }
    }
  });

PetSchema.pre('findOne', function(next){
  var pet = this
  this.info.birth = pet.info.birth.getTime()
  next()
})

PetSchema.statics.create =
async function(info){
  pet = new this();
  pet.info.name = info.name
  pet.info.type = info.type
  pet.info.breed = info.breed
  pet.info.age = info.age
  pet.info.weight = info.weight
  pet.info.personality = info.personality
  pet.info.gender = info.gender
  pet.info.spayed = info.spayed
  pet.info.birth = new Date(info.birth)
  let p = await pet.save()
  console.log(p._id)
  return p._id
}
module.exports = mongoose.model('Pet', PetSchema);
