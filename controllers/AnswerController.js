var Answer = require('../models/Answer.js');
var Question = require('../models/Question.js');
var User = require('../models/User.js');
var Notification = require('../models/Notification.js');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


  exports.answer_create_post = [
    /* Processes the uploading and creation of an answer */
    body("text").isLength({min: 1}).trim().withMessage("Answer field is empty."),

    (req, res, next) => {
      const errors = validationResult(req);

      var answer = new Answer({
      answer: req.body.text,
      userName: req.user.username,
      userID: req.user,
      date: Date.now(),
      question: req.params.id,
      vote: 0,
      votedUsers: [],
    });

    if (req.body.photoData) {
      answer.img.data = new Buffer(req.body.photoData.split(",")[1],"base64");
      var tempMime = req.body.photoData.split(";")[0]
      answer.img.mime = tempMime.split(":")[1];
    }



    //There is an error
    if (!errors.isEmpty()) {
      async.parallel({
        question: function(callback) {
          Question.findById(req.params.id)
              .exec(callback);
        },
        answers: function(callback) {
          Answer.find({'question' : req.params.id})
              .exec(callback);
        },
        notifications: function(callback) {
          Notification.find({"userID" : req.user}).exec(callback);
        },
      }, function(err, results) {
          if (err) {
            return next(err);
          }
          //If we cannot find the question
          if (results.question==null) {
            var err = new Error('Question not found');
            err.staus = 404;
            return next(err);
          }
          //Successfully get the question, render the page
          console.log("Error in answer");

          res.render('question_detail', { user : req.user, notifications: results.notifications,
              question: results.question, answers: results.answers,
              errors: errors.array() });
      });
    } else {
      answer.save(function(err) {
        if (err) {
           return next(err);
        }
        async.parallel({
          question: function(callback) {
            Question.findById(req.params.id)
                .exec(callback);
          },
        }, function(err, results) {
            if (err) {
              return next(err);
            }
            //If we cannot find the question
            if (results.question==null) {
              var err = new Error('Question not found');
              err.staus = 404;
              return next(err);
            }

            //Update the question number of replies
            results.question.replies += 1;

            Question.findByIdAndUpdate(req.params.id, results.question, {}
                  , function (err, updatedQuestion) {
              if (err) {
                return next(err);
              }
              //Successfully get the question, render the page
              console.log("Successfully answered");

              //Create a notification for the answer
              var notification = new Notification({
                user: updatedQuestion.userID,
                date: Date.now(),
              });

              notification.link = updatedQuestion.url;
              notification.information = req.user.username +
                  " answered: " + updatedQuestion.question;

              notification.save(function(err) {
                if (err) {
                  return next(err);
                }
                
                //Redirect to the next page
                console.log(updatedUser);
                res.redirect('/question/' + req.params.id);
              }) ;
            });
        });
      })
    }
  }
];

/* User gets the page to edit an answer */
exports.answer_update_get = function(req, res, next) {
  async.parallel({
    answer: function(callback) {
      Answer.findById(req.params.id).exec(callback);
    },
    notifications: function(callback) {
      Notification.find({"userID" : req.user}).exec(callback)
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

    res.render('answer_edit', {user: req.user, notifications: results.notifications,
       answer: results.answer});
  });
}

/* Processing of an edited ans sent by the user */
exports.answer_update_post = [
  body("text").isLength({min: 1}).trim().withMessage("Answer field is empty."),

  //Answer field is not empty, sanitize data
  //Deal with the data
  (req, res, next) => {
    const errors = validationResult(req);
    //There is an error
    if (!errors.isEmpty()) {
      Answer.findById(req.params.id, function(err, answer) {
        if (err) return res.status(404).send(err);

        Notification.find({"userID" : req.user}, function(err, notifications) {
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

          res.render('answer_edit', {user: req.user, answer: answer,
            notifications: notifications, errors:"Please fill in the updated answer."});
        });
      });
    } else {
      //Retrieve the current answer in the database
      //Update the answer with the new answer keyed in by user
      Answer.findById(req.params.id, function(err, answer) {
        if (err) return res.status(404).send(err);
        answer.answer = req.body.text;

        if (req.body.photoData) {
          answer.img.data = new Buffer(req.body.photoData.split(",")[1],"base64");
          var tempMime = req.body.photoData.split(";")[0]
          answer.img.mime = tempMime.split(":")[1];
        }

        answer.save(function(err) {
          if (err) return res.status(404).send(err);
          console.log('Answer successfully updated!');
        /* Get question and answer details */
          res.redirect('/question/' + answer.question);
        });
      });
    }
  }
];


exports.answer_delete_post = (req, res, next) => {
  Answer.findByIdAndRemove(req.params.id, function(err, deletedAnswer) {
    //Handle potential errors here
    if (err) return res.status(404).send(err);
    console.log('Answer deleted!');

    //Successfully get the question, render the page
    /* Get question and answer details */
    async.parallel({
      question: function(callback) {
        Question.findById(req.body.questionID)
            .exec(callback);
      },
    }, function(err, results) {
        if (err) return res.status(404).send(err);

        if (results.question == null) {
          var err = new Error('Question not found');
          err.staus = 404;
          return next(err);
        };

        results.question.replies -= 1;

        Question.findByIdAndUpdate(req.body.questionID, results.question, {}
              , function (err, updatedQuestion) {
          if (err) {
            return next(err);
          }
          //Successfully get the question, render the page
          console.log("Successfully answered");
          res.redirect('/question/' + req.body.questionID);
        });

    });
  });
};

exports.answer_vote = function(req, res, next) {
  //Get the answer from database
  async.parallel({
    answer: function(callback) {
      Answer.findById(req.params.id).exec(callback);
    },
  }, function(err, results) {
    if (err) {
      next(err);
    }

    results.answer.vote++;
    results.answer.votedUsers.push(req.user);
    var newAnswer = results.answer;

    //Find the user and increase his Points
    User.findById(results.answer.userID, function(err, user) {
      user.points += 5;
      var newUser = user;
      User.findByIdAndUpdate(results.answer.userID, newUser, function(err, updatedAnswer) {
        if (err) {
          next(err);
        }

        //Create the notification to update the user who posted the answer
        //that he got an upvote
        var notification = new Notification({
          user: results.answer.userID,
          date: Date.now(),
        });
        notification.information = req.user.username + "voted for your answer!";
        notification.link = '/question/' + results.answer.question;

        notification.save(function(err) {
          if (err) {
            return next(err);
          }
        }) ;
      });
    });

    //Find the answer and update it once it is done
    Answer.findByIdAndUpdate(req.params.id, newAnswer, function(err, updatedAnswer) {
      if (err) {
        next (err);
      }
      res.redirect('/question/' + updatedAnswer.question);
    });
  });
}
