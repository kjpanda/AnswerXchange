var Question = require('../models/Question.js');
var Answer = require('../models/Answer.js');
var User = require('../models/User.js');
var Notification = require('../models/Notification.js')
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Gives the user the search page */
exports.search_get = function(req, res, next) {
  async.parallel({
    //Get the notifications for the user
    notifications: function(callback) {
      Notification.find({"user": req.user}).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      next(err);
    }

    res.render('search', { user: req.user, notifications: results.notifications });
  });
}

/* Search request for the question send by the user */
exports.search_post = function(req, res, next) {
  async.parallel({
    questions: function(callback) {
      Question.find({"moduleCode": req.body.code, "semester": req.body.semester})
          .exec(callback);
    },
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    //If result cannot be found
    if (results.questions == null) {
      res.render('search', {user: req.user,
          errors: "There are no questions that satify your criteria."});
    }

    //Found matching questions
    res.render('question_list', { user: req.user, questions: results.questions,
          code: req.body.code, semester: req.body.semester });
  });
}

/* User gets the page to upload a question */
exports.question_create_get = function(req, res, next) {
  async.parallel({
    notifications: function(callback) {
      Notification.find({"user": req.user}).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      next(err);
    }

    res.render('question_upload', { user: req.user,
        notifications: results.notifications });
  });

}

/* Processing of a question sent by the user */
exports.question_create_post = [
  body('text').isLength({min:1})
      .trim().withMessage("Question field is empty"),
  body('code').matches(/[A-Z]{2}[0-9]{4}/)
      .trim().withMessage("Invalid Module code"),

  //Sanitize the data
  sanitizeBody('code').trim().escape(),
  //Deal with the data
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('question_upload', { user: req.user, errors: errors.array()});
      return;
    } else {
      async.parallel({
        friends: function(callback) {
          User.find({"_id": req.user.friends}).exec(callback);
        },
        question: function(callback) {
          Question.find({"question": req.body.text}).exec(callback);
        }
      }, function(err, results) {
        if (err) {
          next(err);
        }

        if (results.question.question) {
          //The question already exists, we will just render the question page
          res.redirect(results.question.url);
        } else {
          var question = new Question({
            question: req.body.text,
            replies: 0,
            userID: req.user,
            userName: req.user.username,
            moduleCode: req.body.code,
            semester: req.body.semester,
            date: Date.now(),
          });

          //Save it in the database
          question.save(function (err, savedQuestion) {
            if (err) {
              return next(err);
            }

            //Create the notifications for the friends
            for (let friend of results.friends) {
              var newNotification = new Notification({
                user: friend._id,
                link: savedQuestion.url,
                date: Date.now(),
              });

              newNotification.information = req.user.username +
                  " asked a question, care to help?";

              newNotification.save(function(err) {
                if (err) {
                  next(err);
                }
              });
            }

            res.redirect(savedQuestion.url);
          });
        };
      });
    }
  }
];

/* Get question details */
exports.question_detail_get = function(req, res, next) {
  async.parallel({
    question: function(callback) {
      Question.findById(req.params.id)
          .exec(callback);
    },
    answers: function(callback) {
      Answer.find({'question' : req.params.id}).sort({ 'date':'ascending' })
          .exec(callback);
    },
    notifications: function(callback) {
      Notification.find({'user' : req.user}).exec(callback);
    }
  }, function(err, results) {
      if (err) {
        return next(err);
      }
      //If we cannot find the question
      if (results.question==null) {
        var err = new Error('Question not found');
        err.status = 404;
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

      /* The user should exist */
      //Successfully get the question, render the page
      res.render('question_detail', { user: req.user, notifications: results.notifications,
         question: results.question, answers: results.answers});
      });
}

/* Delete a question, does not work yet */
exports.question_delete_get = function(req, res, next) {
  //Retrieve current question in the database
  async.parallel({
    question: function(callback) {
      Question.findById(req.params.id).exec(callback);
    },
    notifications: function(callback) {
      Notification.find({"user" : req.user}).exec(callback)
    },
  }, function(err, results) {
    if (err) return res.status(404).send(err);

    //Clear this notification
    for (let curr of results.notifications) {
      Notification.findByIdAndRemove(curr._id, function(err, deletedAnswer) {
        if (err) {
          next(err);
        }
      });
    }

    res.render('question_delete', {user: req.user, notifications: results.notifications,
       question: results.question});
  });
}

/* Get the delete posts in question */
exports.question_delete_post = function(req, res, next) {
  //Find the answers with the supposed question id
  //Delete all the answers related to the question
  Answer.deleteMany({ 'question':req.body.questionID } , function(err) {
    if (err) {
      return next(err);
    }

    //After deleting the answers, we will delete the question
    //Delete the question last
    Question.findByIdAndRemove(req.body.questionID, function(err, deletedQuestion) {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  });
}
