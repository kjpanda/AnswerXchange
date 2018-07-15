var LocalStrategy = require('passport-local').Strategy;
var FaceBookStrategy = require('passport-facebook').Strategy;
var User = require('../models/User.js');
var configAuth = require('./auth');
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

  //Strategy for local signups
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
      User.findOne({'local.username' : username}, function(err, user) {
        if (err) {
          return done(err);
        }

        if (user) {
          return done (null, false, req.flash('signupMessage', 'That username is already taken'));
        } else {

          var newUser = new User();

          newUser.username = req.body.username;
          newUser.password = newUser.generateHash(req.body.password);
          newUser.email = req.body.email;
          newUser.major = req.body.major;
          newUser.friends = [];
          newUser.pendingFriends = [];
          newUser.points = 0;

          newUser.local.username = req.body.username;
          newUser.local.password = newUser.generateHash(req.body.password);
          newUser.local.email = req.body.email;
          newUser.local.major = req.body.major;

          //Save the photo if it exists else we use the dafault one
          //to verify that it still works despite fb photo failure to work
          if (req.body.avatarPath) {
            newUser.local.img.data = fs.readFileSync(req.body.avatarPath);
            newUser.local.img.contentType = req.body.mimeType;
            //Delete the photo
            fs.unlink(req.body.avatarPath, function(err) {
              if(err) {
                return next(err);
              }
            });
          } else {
            var tempPath = process.cwd() + '/public/images/user-1.png'
            newUser.local.img.data = fs.readFileSync(tempPath);
            newUser.local.img.contentType = 'image/png';
          }

          newUser.save(function(err) {
            if (err) {
              //Error due to the email being the same
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
      User.findOne({ 'local.username': username }, function(err, user) {
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

  //Strategy for FaceBook
  passport.use(new FaceBookStrategy ({
    //pull in app id and secret from auth.js file
    clientID : configAuth.facebookAuth.clientID,
    clientSecret : configAuth.facebookAuth.clientSecret,
    callbackURL : configAuth.facebookAuth.callbackURL,
    profileFields : configAuth.facebookAuth.profileFields,
    passReqToCallback : true
  },

  //facebook will send back the token and profile
  function(req, token, refreshToken, profile, done) {

    //ansync
    process.nextTick(function() {
      //find the user in the database based on their facebook id
      User.findOne({'facebook.id' : profile.id}, function(err, user) {
        //if there is an error, stop everything and return that
        //ie an error connecting ot the database
        if (err)
           return done(err);
        //if the user is found, then log them in
        if (user) {
          return done (null, user); //user found, return that user
        } else {
          //if there is no user found with that facebook id, create them
          var newUser = new User();
          //set all the facebook information in our user model
          newUser.username = profile.displayName;
          newUser.email = profile.emails[0].value;
          newUser.friends = [];
          newUser.pendingFriends = [];
          newUser.points = 0;

          newUser.facebook.id = profile.id; //set the user facebook id
          newUser.facebook.token = token; // save the token that facebook provides to the user
          newUser.facebook.username = profile.displayName; //retrieve the display name from user facebook
          newUser.facebook.email = profile.emails[0].value; //facebook can return multiple emails so we'll take the first

          if (profile.photos[0].value) {
            newUser.photoLink = profile.photos[0].value;
            newUser.facebook.photoLink = profile.photos[0].value;
          } else {
            var tempPath = process.cwd() + '/public/images/user-1.png';
            newUser.photoLink = tempPath;
            newUser.facebook.photoLink = tempPath;
          }


          //save our user to the database
          newUser.save(function(err) {
            if (err)
               throw err;
            //if successful, return the new user
            return done(null, newUser);
          });
        }
      });
    });
  }));
};
