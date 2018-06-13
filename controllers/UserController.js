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
  res.render('home', {message: req.flash('homeMessage')});
}

/* Get user details */
exports.user_get = function(req, res, next) {
  res.render('home', { username: req.user.username, email: req.user.email,
    major: req.user.major});
}

/* Processing of the user's login */
/*exports.user_login_post = function(req, res, next) {
  //Search through my database for the username given
  async.parallel({
    user: function(callback) {
      User.find({"username": req.body.username, "password": req.body.password})
          .exec(callback);
    },
  }, function(err, results) {
    //If we cannot find the Username
    if (err || results.user==null) {
      console.log("User not found");
      res.render('login', {errors:"The username or password does not match."});
    }
      //For now we go to search place
      res.render('search', {user: results.user});
  });
}*/

/* Getting the signup page initially */
exports.user_create_get = function(req, res, next) {
  res.render('signup', {message: req.flash('signupMessage')});
}

/*exports.user_create_post =[
  body('username').isLength({min:8, max:24})
      .trim().withMessage("Username must be between 8 to 24 characters long.")
      .isAlphanumeric().withMessage("Username has non-alphanumeric characters."),
  body('email').isEmail().withMessage("Invalid email."),
  body('password').isLength({min:8, max:24})
      .trim().withMessage("Password must be between 8 to 24 characters long."),

  //Sanitize the data
  sanitizeBody('username').trim().escape(),
  sanitizeBody('email').trim().escape(),
  sanitizeBody('password').trim().escape(),

  //Process the request after validation
  (req, res, next) => {
    const errors = validationResult(req);

    //If there is an error we go back to the sign up page
    if (!errors.isEmpty()) {
      res.render('signup', {errors: errors.array()})
      return;
    } else {
      //Data is valid, create a new user
      var user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        major: req.body.major
      });
      user.save(function(err) {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    }
  }
];*/
