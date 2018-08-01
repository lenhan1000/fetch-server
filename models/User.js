var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  displayName: { type: String },
  address: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  zipCode: { type: String },
  countryCode: { type: String },
  mobilePhone: { type: String },
  carrier: { type: String },
  updateAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User',UserSchema);
