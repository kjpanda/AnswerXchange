var User = require('../models/User.js');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Gets the intitial page of the website, login page if the user
  has not logged in else it will be the user's home page*/
exports.user_login_get = function(req, res, next) {
  res.render('login', {message: req.flash('loginMessage')});
}

/* Getting the home page when user is logged in */
exports.user_home_get = function(req, res, next) {
  res.render('home', {message: req.flash('homeMessage'),
      user: req.user});
}

/* Getting the signup page initially */
exports.user_create_get = function(req, res, next) {
  res.render('signup', {message: req.flash('signupMessage')});
}
