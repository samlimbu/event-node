const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = mongoose.Schema({
     first_name:{
          type: String,
          required: true
     },
     middle_name:{
          type: String
     },
     last_name:{
          type: String,
          required: true
     },
     email:{
          type: String,
          required: false
     },
     username:{
          type:String,
          required: true,
          unique: true
     },
     id:{
          type:String,
          required: false
     },
     password:{
          type: String,
          required: true
     },
     roles:{
          type: [],
          required: true
     },

});


UserSchema.pre("insertMany", async function (next, docs) {
     console.log("inserprehook",docs);
     if (Array.isArray(docs) && docs.length) {
         const hashedUsers = docs.map(async (user) => {
             return await new Promise((resolve, reject) => {
                 bcrypt.genSalt(10).then((salt) => {
                     let password = user.password.toString()
                     bcrypt.hash(password, salt).then(hash => {
                         user.password = hash
                         resolve(user)
                     }).catch(e => {
                         reject(e)
                     })
                 }).catch((e) => {
                     reject(e)
                 })
             })
         })
         docs = await Promise.all(hashedUsers)
         next()
     } else {
         return next(new Error("User list should not be empty")) // lookup early return pattern
     }
 })

//  UserSchema.pre('save', function (next) {
//      let user = this
//      if (!user.isModified("password")) {
//          next()
//      } else {
//          bcrypt.genSalt(10, function (err, salt) {
//              if (err) return next(err)
 
//              bcrypt.hash(user.password, salt, function (err, hash) {
//                  if (err) return next(err)
 
//                  user.password = hash
//                  next()
//              })
//          })
//      }
//  })
 const User =  mongoose.model("User", UserSchema);
module.exports = User;
module.exports.getUsers =function (callback){
     User.find(callback);
}
module.exports.getUserById =function (id, callback){
     User.findById(id, callback);
}
module.exports.getUserByUsername=function(username, callback){
     const query = {username:username}
     User.findOne(query, callback);
}
// module.exports.findByIdAndUpdate = function (id, body, callback){
//     User.findByIdAndUpdate(id, body, callback);
// }


module.exports.updateUserByQuery = function(query, obj, callback){
     User.findOneAndUpdate(query,obj,callback);
}

module.exports.addUser = function(newUser, callback){
     bcrypt.genSalt(10, (err,salt)=>{
          bcrypt.hash(newUser.password, salt, (err, hash)=>{
               if(err){
                    throw err;
               }
               newUser.password = hash;
               newUser.save(callback);
              
          });
     });
}
module.exports.changePassword = function(newUser, callback){

    bcrypt.genSalt(10, (err,salt)=>{
         bcrypt.hash(newUser.password, salt, (err, hash)=>{
              if(err){
                   throw err;
              }
              newUser.password = hash;
              console.log('changePassword hash', newUser);
              this.findOneAndUpdate({username:newUser.username} , 
                {
                    $set: { password: newUser.password }
                  }
                  , callback);
         });
    });
}
module.exports.comparePassword = function(candidatePassword, hash, callback){
     bcrypt.compare(candidatePassword, hash, (err, isMatch)=>{
          if(err) throw err;
          console.log('cpassword',candidatePassword, hash, isMatch);
          callback(null, isMatch);

     });
}