var Answer = require('../models/Answer.js');
var Question = require('../models/Question.js');
var User = require('../models/User.js');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Processes the uploading and creation of an answer */
exports.answer_create_post = [
  body("text").isLength({min: 1}).trim().withMessage("Answer field is empty."),

  (req, res, next) => {
    const errors = validationResult(req);

    var answer = new Answer({
      answer: req.body.text,
      userName: req.user.username,
      userID: req.user,
      date: Date.now(),
      question: req.params.id,
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

          res.render('question_detail', { user : req.user,
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
          answers: function(callback) {
            Answer.find({'question' : req.params.id})
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
            //Successfully get the question, render the page
            console.log("Successfully answered");
            res.render('question_detail', { user: req.user,
                question: results.question, answers: results.answers});
        });
      })
    }
  }
];

/* User gets the page to edit an answer */
exports.answer_update_get = function(req, res, next) {
  //Retrieve current answer in the database
  Answer.findById(req.params.id, function(err, answer) {
    if (err) return res.status(404).send(err);
    res.render('answer_edit', {user: req.user, answer: answer});
  });
}

/* Processing of an edited ans sent by the user */
exports.answer_update_post = [
  body("text").isLength({min: 1}).trim().withMessage("Answer field is empty."),

  //Answer field is not empty, sanitize data
  //sanitizeBody('code').trim().escape(),
  //Deal with the data
  (req, res, next) => {
    const errors = validationResult(req);
    //There is an error
    if (!errors.isEmpty()) {
      Answer.findById(req.params.id, function(err, answer) {
        if (err) return res.status(404).send(err);
        res.render('answer_edit', {user: req.user, answer: answer,
            errors:"Please fill in the updated answer."});
        return next();
      });
    } else {
      //Retrieve the current answer in the database
      //Update the answer with the new answer keyed in by user
      Answer.findById(req.params.id, function(err, answer) {
        if (err) return res.status(404).send(err);
        answer.answer = req.body.text;
        answer.save(function(err) {
          if (err) return res.status(404).send(err);
          console.log('Answer successfully updated!');
        /* Get question and answer details */
        async.parallel({
          question: function(callback) {
            Question.findById(answer.question)
                .exec(callback);
          },
          answers: function(callback) {
            Answer.find({'question' : answer.question})
                .exec(callback);
          },
        }, function(err, results) {
            if (err) return res.status(404).send(err);

            //Successfully get the question, render the page
            res.render('question_detail', { user: req.user, question: results.question,
                answers: results.answers});
            });
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
    }, function(err, questionResult) {
        if (err) return res.status(404).send(err);

        //Successfully get the question, now we need to get the answers
        async.parallel({
          answers: function(callback) {
            Answer.find({'question': questionResult.question._id})
                .exec(callback);
          }
        }, function(err, results) {
          if (err) return res.status(404).send(err);

          //Successfully get the question, render the page
          res.render('question_detail', { user: req.user,
              question: questionResult.question, answers: results.answers});
        });
      });
  });
};
