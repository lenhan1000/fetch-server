var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');


var saltRounds = 10;

var UserSchema = new mongoose.Schema({
  local: {
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
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: String },
    countryCode: { type: String },
    mobilePhone: { type: String },
    carrier: { type: String },
  },
  updateAt: { type: Date, default: Date.now },
});

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

UserSchema.methods.verifyPassword = async function(password){
  return bcrypt.compareSync(password, this.local.password);
}

UserSchema.methods.removePassword = async function(){
  this.local.password = undefined;
  return this;
}

UserSchema.methods.sign = async function(secret){
  return await jwt.sign(this.toObject(), secret)
}

UserSchema.statics.getInfo = async function(token){
  return await jwt.decode(token).info;
}

UserSchema.statics.create = async function(info) {
  let user = await this.findOne({
      'local.email': info.email
    })
  if (user) return false;
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
    return user.save()
  }
}

UserSchema.statics.findByEmail = async function(email){
   return await this.findOne({'local.email':email})
}

module.exports = mongoose.model('User', UserSchema);
