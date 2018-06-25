var Question = require('../models/Question.js');
var User = require('../models/User.js');
var async = require('async');
var fs = require('fs');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Gets the initial page of the website, the user will be led to an
   explore page where the user will be given the latest discussions */
exports.user_explore_get = function(req, res, next) {
  //res.send("NOT IMPLEMENTED: USER_EXPLORE_GET");
  async.parallel({
    questions: function(callback) {
      Question.find().sort('time').limit(10).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    res.render('explore', { questions:results.questions });
  });
}

/* Gets login page of the website
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

/* Get the page to edit the user details */
exports.user_update_get = function(req,res, next) {
  res.render('profile_edit', {user: req.user});
}

exports.user_update_post = [
  body("password").isLength({ min:1 }).trim()
      .withMessage("Please enter a password"),
  function(req, res, next) {
    const errors = validationResult(req);

    console.log(req.body);

    //If there is an error we will render the page we came from
    if (!errors.isEmpty()) {
      res.render('profile_edit', { user:req.user, message:errors });
      next();
    } else {
      //No errors, we will retrieve the user from database and update it
      async.parallel({
        user: function(callback) {
          User.findById(req.user._id).exec(callback);
        },
      }, function (err, results) {
        if (err) {
          return next(err);
        }

        var newUser = results.user;

        //Update the email
        newUser.email = req.body.email;

        //Save the photo if it exists else we use the dafault one
        if (req.body.avatarPath) {
          newUser.img.data = fs.readFileSync(req.body.avatarPath);
          newUser.img.contentType = req.body.mimeType;
          //Delete the photo
          fs.unlink(req.body.avatarPath, function(err) {
            if(err) {
              return next(err);
            }
          });
        } else {
          var tempPath = __dirname.split('/').slice(0, -1).join('/');
          tempPath += '/public/images/user-1.png'
          newUser.img.data = fs.readFileSync(tempPath);
          newUser.img.contentType = 'image/png';
        }

        //Hash and save the new password
        newUser.password = newUser.generateHash(req.body.password);

        //Update the database accordingly
        User.findByIdAndUpdate(req.user._id, newUser, function(err) {
          if (err) {
            return next(err);
          }

          console.log("Profile successfully updated");
          res.redirect('/home');
        });
      });
    }
  }
];
