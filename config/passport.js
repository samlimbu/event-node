const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/users');
const config = require('../config/database');

module.exports = function(passport){
     let opts= {};
     opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");
     opts.secretOrKey = config.secret;
     passport.use(new JwtStrategy(opts, (jwt_payload, done)=>{
          console.log('opts', opts, opts.jwtFromRequest);
          console.log('jwt payload.data', jwt_payload.data);
          console.log('jwt payload.data._id', jwt_payload.data._id);
          User.getUserById(jwt_payload.data._id, (err, user)=>{
               if(err){
                    return done(err, false);
               }
               if(user){
                    console.log('user');
                    return done(null, user);
               } 
               else{
                    console.log('no user');
                    return done(null, false);
               }
          })
     }));
}
