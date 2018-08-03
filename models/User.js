var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

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
  }
  // info    :{
  //   displayName: { type: String },
  //   address: { type: String },
  //   country: { type: String },
  //   state: { type: String },
  //   city: { type: String },
  //   zipCode: { type: String },
  //   countryCode: { type: String },
  //   mobilePhone: { type: String },
  //   carrier: { type: String },
  //   updateAt: { type: Date, default: Date.now },
  // },
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

UserSchema.statics.create = function(email, pass) {
  return this.findOne({
      'local.email': email
    })
    .then(user => {
      if (user) return false;
      else {
        var user = new this();
        user.local.email = req.body.email;
        user.local.password = req.body.password;
        return user.save()
      }
    }).catch(next);
}

module.exports = mongoose.model('User', UserSchema);
