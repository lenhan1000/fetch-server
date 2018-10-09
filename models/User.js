var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Pet = require("./Pet");
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


var saltRounds = 10;

var UserSchema = new mongoose.Schema({
  local :{
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
  },
  info    :{
    displayName: { type: String },
    address: { type: String },
    country: { type: Map, of: String, default: {}},
    state: { type: Map, of: String, default: {}},
    city: { type: String },
    zipCode: { type: String },
    countryCode: { type: String },
    mobilePhone: { type: String },
    carrier: { type: String },
  },
  pets: [{
    _id: false,
    id:{
      type: Schema.Types.ObjectId,
      ref: "Pet",
      unique: true,
      required: true
    },
    name:{type: String},
    type:{type: String},
    relationship:{type:String}
  }],
  instances: [{
    _id: false,
    instanceId: {
      type: String,
      unique: true,
      required: true
    },
    brand: String,
    version: String,
    versionNumb: Number,
    bootloader: String,
    board: String,
    device: String,
    display: String,
    fingerprint: String,
    hardware: String,
    manufacturer: String,
    model: String,
    product: String,
  }],
  lastLoc :{
    lat: {type: Number},
    long: {type: Number}
  },
  locHist : [{
    _id:false,
    date :{type: Date},
    lat :{type: Number},
    long :{type: Number}
  }],
  lastAccess :{ type: Date, default: Date.now },
  updateAt :{ type: Date, default: Date.now},
},{
  toJSON: {
    transform: function(doc, ret){
      delete ret._id
      delete ret.updateAt
    }
  }
}
);

UserSchema.pre('save', function(next) {
  var user = this;
  if (this.isModified('password') || this.isNew) {
    bcrypt.hash(user.local.password, saltRounds)
      .then(hash => {
        user.local.password = hash;
        next();
      }).catch(next);
  }else{ next() }
})

UserSchema.methods.verifyPassword =
async function(password){
  return bcrypt.compareSync(
    password, this.local.password
  )
}

UserSchema.methods.sign =
async function(secret){
  signInfo = {_id: this._id}
  return await jwt.sign(signInfo, secret)
}

UserSchema.statics.findByToken =
async function(token){
  let id = await this.getIdFromToken(token)
  return await this.findById(id)
}

UserSchema.statics.getInfo =
async function(token){
  let id = await jwt.decode(token)._id
  user = await this.findById(id)
  return user.info
}

UserSchema.statics.addPet =
async function(token, info){
  let id  = await this.getIdFromToken(token)
  let p;
  await Pet.create(info)
  .then(petId => {
    if (!petId) return null
    else p = {
      id: petId,
      name: info.name,
      type: info.type,
      relationship: ""
    }
  })
  await this.findByIdAndUpdate(
    id,
    {$push: {"pets": p}},
    {safe: true, upsert: true}
  ).then(user => {
    if (!user) return null
  })
  return await this.findByIdAndUpdate(
    id,
    {$set: {"updateAt": new Date()}}
  )

}

UserSchema.statics.getIdFromToken =
async function(token){
  return await jwt.decode(token)._id;
}

UserSchema.statics.create =
async function(info) {
  let user = await this.findOne({
      'local.email': info.email
    })
  if (user) return null;
  else{
    user = new this();
    user.local.email = info.email;
    user.local.password = info.password;
    user.info.displayName = info.displayName;
    user.info.address = info.address;
    user.info.country = info.country;
    user.info.state = info.state;
    user.info.city = info.city;
    user.info.zipCode = info.zipCode;
    user.info.countryCode = info.countryCode;
    user.info.mobilePhone = info.mobilePhone;
    user.info.carrier = info.carrier;
    user.pet = []
    user.lastLock = []
    return await user.save()
  }
}

UserSchema.statics.findByEmail =
async function(email){
   return await this.findOne({'local.email':email})
}

//Child schema methods
UserSchema.statics.findPets =
async function(token){
  let user;
  let id = await this.getIdFromToken(token)
  await this.findById(id)
    .then(u => {
      if (!u) return null
      else user = u
    })
  return await this.sanitizePets(user.pets)
}

UserSchema.statics.sanitizePets =
async function(pets){
  return pets
}

UserSchema.statics.saveUserInstanceToken =
async function(token, info){
  let user;
  let id = await this.getIdFromToken(token)
  await this.findById(id)
    .then(u => {
       if (!u) return null
    })
  let old = info.oldInstanceId
  await this.update(
    {_id: id},
    { $pull: {instances: {instanceId: old}}},
    {safe: true}
  ).then(u => {
       if (!u) return null
    })
  delete info.oldInstanceId
  await this.update(
    {_id: id},
    {$push: {"instances": info}},
    {safe: true, upsert: true}
  ).then(u => {
    if (!u) return null
  })
  return await this.findByIdAndUpdate(
    id,
    {$set: {"updateAt": new Date()}}
  )
}

UserSchema.statics.saveDateLoc =
async function(token, info){
  let id = await this.getIdFromToken(token)
  date = new Date(info.date)
  return await this.update(
    {_id: id, 'locHist.date' : {"$ne": date}},
    {$set: {lastAccess: date,
      lastLoc: {lat: info.lat, long: info.long}},
      $push: {locHist: {
        date: date,
        lat: info.lat,
        long: info.long
      }}
    }
  )
}



module.exports = mongoose.model('User', UserSchema);
