var Question = require('../models/Question.js');
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
  //If user does not exist we goto the login page
  if (req.user == null) {
    res.redirect('/');
  }

  async.parallel({
    questions: function (callback) {
      Question.find({"userID" : req.user}).
          sort('time').limit(5).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.render('home', {user: req.user,
        questions: results.questions});
  });
}

/* Getting the signup page initially */
exports.user_create_get = function(req, res, next) {
  res.render('signup', {message: req.flash('signupMessage')});
}
