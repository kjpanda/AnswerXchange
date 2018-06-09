var mongoose = require("mongoose");
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  //The usernmame, should be 8 to 24 characters long
  username: {type: String, min: 8, max: 24, required: true},
  //The password for the user,should be 8 to 24 characters long
  password: {type: String, min: 8, max: 24, required: true},
  //The email of the username
  email: {type: String, required: true, unique: true},
  //The major for the individual, used for personalisation
  major: {type: String},
});

//Methods to generate a hash
UserSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//Check if the password is valid
UserSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

//Virtual to get the url for the user page
UserSchema.virtual("url").get(function() {
  return "/user/" + this._id;
});

module.exports = mongoose.model("User", UserSchema);
