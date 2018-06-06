var Answer = require('../models/Answer.js');
var Question = require('../models/Question.js')
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Processes the uploading and creation of an answer */
exports.answer_create_post = [
  body("answer").isLength({min: 1}).trim().withMessage("Answer field is empty."),

  (req, res, next) => {
    const errors = validationResult(req);

    var answer = new Answer({
      answer: req.body.answer,
      user: null,
      date: Date.now(),
      question: req.params.id,
    });

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
        }
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
          console.log("Error");
          res.render('question_detail', {question: results.question, answers: results.answers,
              errors: errors.array()});
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
          }
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
            console.log("Successful request");
            res.render('question_detail', {question: results.question, answers: results.answers});
        });
      })
    }
  }
];

exports.answer_update_get = function(req, res) {
  res.send("NOT IMPLEMENTED: ANSWER_UPDATE_GET");
}

exports.answer_update_post = function(req, res) {
  res.send("NOT IMPLEMENTED: ANSWER_UPDATE_POST");
}

exports.answer_delete_post = function(req, res) {
  res.send("NOT IMPLEMENTED: ANSWER_DELETE_POST");
}
