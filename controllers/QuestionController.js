var Question = require('../models/Question.js');
var Answer = require('../models/Answer.js');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

/* Gives the user the search page */
exports.search_get = function(req, res, next) {
  res.render('search');
}

/* Search request for the question send by the user */
exports.search_post = function(req, res, next) {
  async.parallel({
    questions: function(callback) {
      Question.find({"moduleCode": req.body.code, "semester": req.body.semester})
          .exec(callback);
    }
  }, function(err, results) {
    if (err) {
      return next(err);
    }

    //If result cannot be found
    if (results.questions == null) {
      res.render('search', {errors: "There are no questions that satify your criteria."});
    }

    //Found matching questions
    res.render('question_list', {questions: results.questions,
          code: req.body.code, semester: req.body.semester});
  });
}

/* User gets the page to upload a question */
exports.question_create_get = function(req, res, next) {
  res.render('question_upload', {user: req.body.user});
}

/* Processing of a question sent by the user */
exports.question_create_post = [
  body('question').isLength({min:1})
      .trim().withMessage("Question field is empty"),
  body('code').matches(/[A-Z]{2}[0-9]{4}/)
      .trim().withMessage("Invalid Module code"),

  //Sanitize the data
  sanitizeBody('code').trim().escape(),
  //Deal with the data
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('question_upload', {errors: errors.array()});
      return;
    } else {
      //Look through the question database and check if there is one with the
      //exact same question
      var question = new Question({
        question: req.body.question,
        replies: 0,
        user: null,
        moduleCode: req.body.code,
        semester: req.body.semester,
      });

      //Save it in the database
      question.save(function (err) {
        if (err) {
          return next(err);
        }
        res.render('question_upload');
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
      res.render('question_detail', {question: results.question, answers: results.answers});
  });
}
