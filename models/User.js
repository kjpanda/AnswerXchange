var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  //The usernmame, should be 8 to 24 characters long
  username: {type: String, min: 8, max: 24},
  //The password for the user,should be 8 to 24 characters long
  password: {type: String, min: 8, max: 24},
  //The email of the username
  email: {type: String},
  //The major for the individual, used for personalisation
  major: {type: String},
  //Friends of the current userID
  friends: [Schema.ObjectId],
  //Friends that are pending
  pendingFriends: [Schema.ObjectId],
  //Points that a user has to purchase notes
  points: {type: Number},

  local : {
    //The usernmame, should be 8 to 24 characters long
    username: {type: String, min: 8, max: 24},
    //The password for the user,should be 8 to 24 characters long
    password: {type: String, min: 8, max: 24},
    //The email of the username
    email: {type: String},
    //The major for the individual, used for personalisation
    major: {type: String},
    //User image
    img: { data: Buffer, contentType: String },
  },
  facebook : {
    id : {type: String },
    token : {type: String },
    username : {type: String },
    email : {type: String },
    photoLink: { type: String },
  },

  google: {
    id : {type: String },
    token : {type: String },
    username : {type: String },
    email : {type: String },
    photoLink: { type: String },
  }
});

//Methods to generate a hash
UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Check if the password is valid
UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.local.password);
};

//Virtual to get the url for the user page
UserSchema.virtual("edit_page").get(function() {
  return "/edit/" + this._id;
});

//Virtual to get the data of the user photo in base64
UserSchema.virtual("photo_URI").get(function() {
  return "data:" + this.local.img.contentType + ";base64," +
      Buffer.from(this.local.img.data, 'binary').toString('base64');
});

module.exports = mongoose.model("User", UserSchema);
