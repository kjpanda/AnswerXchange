var User = require('../models/User.js');
var async = require('async');

/* Gets the intitial page of the website, login page if the user
  has not logged in else it will be the user's home page*/
exports.user_login_get = function(req, res, next) {
  res.render('login', { user:"" });
}

/* Processing of the user's login */
exports.user_login_post = function(req, res, next) {
  res.send("NOT IMPLEMENTED: USER_LOGIN_POST");
}
