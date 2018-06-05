const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');
const keys = require('../config/keys');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.secretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      // Find User by ID
      User.findById(jwt_payload.id)
        .then(user => {
          if(user) {
            // Return user and null for error if User found
            return done(null, user);
          }
          // Return false for user and null for error if User not found
          return done(null, false);
        })
        .catch(err => console.log(err));
    })
  );
};
