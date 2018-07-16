var Question = require('../models/Question.js');
var User = require('../models/User.js');
var Notification = require('../models/Notification.js');
var async = require('async');
var fs = require('fs');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Gets the initial page of the website, the user will be led to an
   explore page where the user will be given the latest discussions */
exports.user_explore_get = function(req, res, next) {
  //res.send("NOT IMPLEMENTED: USER_EXPLORE_GET");
  if (req.user !== undefined) {
    async.parallel({
      questions: function(callback) {
        Question.find().sort('time').limit(10).exec(callback);
      },
      notifications: function(callback) {
        Notification.find({ "user" : req.user._id }).exec(callback);
      },
      pendingFriends: function(callback) {
        User.find({"_id" : req.user.pendingFriends }).exec(callback);
      },
    }, function(err, results) {
      if (err) {
        return next(err);
      }

      //Clear this notification
      for (let curr of results.notifications) {
        Notification.findByIdAndRemove(curr._id, function(err, deletedAnswer) {
          if (err) {
            next(err);
          }
        });
      }

      res.render('explore', { questions:results.questions, user: req.user,
          notifications: results.notifications, pendingFriends: results.pendingFriends });
    });
  } else {
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
    notifications: function(callback) {
      Notification.find({"user": req.user}).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    //Clear this notification
    for (let curr of results.notifications) {
      Notification.findByIdAndRemove(curr._id, function(err, deletedAnswer) {
        if (err) {
          next(err);
        }
      });
    }

    res.render('home', {user: req.user, notifications: results.notifications,
        questions: results.questions});
  });
}

/* Getting the signup page initially */
exports.user_create_get = function(req, res, next) {
  res.render('signup', {message: req.flash('signupMessage')});
}

/* Get the page to edit the user details */
exports.user_update_get = function(req,res, next) {
  async.parallel({
    notifications: function(callback) {
      Notification.find({"user" : req.user}).exec(callback);
    },
  }, function (err, results) {
    if (err) {
      next(err);
    }

    //Clear this notification
    for (let curr of results.notifications) {
      Notification.findByIdAndRemove(curr._id, function(err, deletedAnswer) {
        if (err) {
          next(err);
        }
      });
    }

    //All is successful and we will serve the edit page
    res.render('profile_edit', {user: req.user,
      notifications: results.notifications});
  });
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
          var tempPath = process.cwd() + '/public/images/user-1.png'
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

//Function that searches the database for the users base on their username
exports.user_search_post = function(req, res, next) {
  async.parallel({
    users: function(callback) {
      User.find({"username": req.body.name}).exec(callback);
    },
    notifications: function(callback) {
      Notification.find({"user": req.user}).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      next(err);
    }

    //Go through the list and remove all those that are
    var newFriends = [];
    for (let user of results.users) {
      //If it is not in the friends list and in the pending list
      //and not the same user
      var userID = JSON.stringify(user._id);
      if(!JSON.stringify(req.user.pendingFriends).includes(userID) &&
          !JSON.stringify(req.user.friends).includes(userID) &&
            JSON.stringify(req.user._id).localeCompare(userID)) {
        newFriends.push(user);
      }
    }

    //Render the result page for friend search
    res.render('friends_results', {user: req.user, notifications: results.notifications,
        friends: newFriends});
  });
}

//Function to retrieve the friends of a user
exports.user_friends_get = function(req, res, next) {
  async.parallel({
    friends: function(callback) {
      User.find({ "_id": req.user.friends }).exec(callback);
    },
    notifications: function(callback) {
      Notification.find({ "user" : req.user._id }).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      next(err);
    }

    //Clear this notification
    for (let curr of results.notifications) {
      Notification.findByIdAndRemove(curr._id, function(err, deletedAnswer) {
        if (err) {
          next(err);
        }
      });
    }

    res.render('friends', {user: req.user, notifications: results.notifications,
        friends: results.friends});
  });
}

//Function to add a friend, the current user should be in the pending request
//of the other user.
exports.user_add_friend = function(req, res, next) {
  async.parallel({
    friend: function(callback) {
      User.findById(req.body.friendID).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      next(err);
    }

    //Add the request to the new friend
    results.friend.pendingFriends.push(req.user._id);
    var newFriend = results.friend;

    //Update the database accordingly
    User.findByIdAndUpdate(req.body.friendID, newFriend, function(err) {
      if (err) {
        return next(err);
      }

      console.log("Friend request sent");
      //Go back to the home page
      res.redirect('/');
    });
  });
}

//Accepts a friend request, both users should be added to the others friend
//list and there should be notification sent to both side
exports.accept_friend = function(req, res, next) {
    async.parallel({
      friend: function(callback) {
        User.findById(req.body.friendID).exec(callback);
      },
      currUser: function (callback) {
        User.findById(req.user._id).exec(callback);
      },
    }, function(err, results) {
      if (err) {
        next(err);
      }

      var currUser = results.currUser;
      var friend = results.friend;

      //Check the value of the acceptance
      //If it is accepted we will update both users and give them notifications
      if (req.body.acceptance.localeCompare("accept") === 0) {
          //Update the current user
          currUser.friends.push(req.body.friendID);
          //Go through the pending friends and delete the friendID
          for (var i = 0; i < currUser.pendingFriends.length ; i++) {
            if (JSON.stringify(currUser.pendingFriends[i]).localeCompare(req.body.friendID)) {
              currUser.pendingFriends.splice(i, 1);
            }
          }

          User.findByIdAndUpdate(req.user._id, currUser, function(err) {
            if (err) {
              next(err);
            }
          });

        //Update the friend
        friend.friends.push(req.user._id);

        User.findByIdAndUpdate(friend._id, friend, function(err) {
          if (err) {
            next (err);
          }
        });

        //Add in the notifications for the user
        var userNotification = new Notification({
          user: req.user._id,
          link: "#",
          date: Date.now(),
        });

        userNotification.information = friend.username + " is now your friend.";

        userNotification.save(function(err) {
          if (err) {
            next (err);
          }

          //Give a notification to the friend
          var friendNotification = new Notification({
            user: friend._id,
            link: "#",
            date: Date.now(),
          });

          friendNotification.information = currUser.username + " is now your friend.";

          friendNotification.save(function(err) {
            if (err) {
              next(err);
            }
            res.redirect('/');
          });
        });

      } else {
        //Go through the pending friends and delete the friendID
        for (var i = 0; i < currUser.pendingFriends.length ; i++) {
          if (JSON.stringify(currUser.pendingFriends[i]).localeCompare(req.body.friendID)) {
            currUser.pendingFriends.splice(i, 1);
          }
        }
        
        //Update thue user once the pending friend is gone
        User.findByIdAndUpdate(req.user._id, currUser, function(err) {
          if (err) {
            next(err);
          }
        });

        //Add in the notifications for the user
        var userNotification = new Notification({
          user: req.user._id,
          link: "#",
          date: Date.now(),
        });

        userNotification.information = friend.username + " has been declined.";

        userNotification.save(function(err) {
          if (err) {
            next (err);
          }

          //Give a notification to the friend
          var friendNotification = new Notification({
            user: friend._id,
            link: "#",
            date: Date.now(),
          });

          friendNotification.information = currUser.username +
              "has decline your friend request.";

          friendNotification.save(function(err) {
            if (err) {
              next(err);
            }
            res.redirect('/');
          });
        });
      }
    });
}
