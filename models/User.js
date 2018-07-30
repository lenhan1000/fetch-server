var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new mongoose.Schema({
  _id: Schema.Types.ObjectId,
  display_name: String,
  address: String,
  country: String,
  state: String,
  city: String,
  zip_code: String,
  country_code: Number,
  mobile_phone: String,
  carrier: String,
  updated_at: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User',UserSchema);
