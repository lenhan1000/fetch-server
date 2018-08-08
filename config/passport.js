var JwtStrategy = require('passport-jwt').Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require("../models/User");
var config = require('../config/database');

//Set up passport
module.exports = passport => {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("JWT");
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findById(jwt_payload._id, function(err, user) {
          if (err) {
              return done(err, false);
          }
          if (user) {
              user.local.password = undefined;
              done(null, user);
          } else {
              done(null, false);
          }
      });
  }));
}
