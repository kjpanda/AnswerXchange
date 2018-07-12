var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User.js');
var async = require('async');
var fs = require('fs');

//This will be a function that modifies a given passport instance
module.exports = function (passport) {
  //Function to serialize and deserialize a user
  passport.serializeUser(function (user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function (id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  //Strategy for signups
  //Name the strategy and then define what it is
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true, //Gives the additional data in the method
  }, function (req, username, password, done) {
    //Turn the process into an asynchronous one
    //Check that both the username and the email are not taken
    process.nextTick(function() {
      //Find and check that there is no user with the same username
      User.findOne({'username' : username}, function(err, user) {
        if (err) {
          return done(err);
        }

        if (user) {
          return done (null, false, req.flash('signupMessage', 'That username is already taken'));
        } else {
          var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            major: req.body.major,
            points: 0,
          });

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
            var tempPath = process.cwd() + '/public/images/user-1.png'
            newUser.img.data = fs.readFileSync(tempPath);
            newUser.img.contentType = 'image/png';
          }

          newUser.password = newUser.generateHash(req.body.password);
          newUser.friends = [];
          newUser.pendingFriends = [];
          
          newUser.save(function(err) {
            if (err) {
              //Error due to the email being the save
              if (err.message.indexOf('duplicate key error')) {
                console.log(err.message);
                return done (null, false, req.flash('signupMessage', 'That email is already taken'));
              }
              throw err;
            }
            return done(null, newUser);
          });
        }
      });
    });
}));

  //Strategy for logins
  passport.use('local-login', new LocalStrategy({
      //By default it is username and password field
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    }, function(req, username, password, done) {
      User.findOne({ 'username': username }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false,
              req.flash('loginMessage', 'Incorrect username.'));
        }
        if (!user.validPassword(password)) {
          return done(null, false,
              req.flash('loginMessage', 'Incorrect password.'));
        }
        //Success!!
        return done(null, user);
      });
    }
  ));
}
