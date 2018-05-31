var Question = require('../models/Question.js');
var async = require('async');

/* Gives the user the search page */
exports.search_get = function(req, res, next) {
  res.render('search', { user: req.body.user });
}

/* Search request for the question send by the user */
exports.search_post = function(req, res, next) {
  res.send("NOT IMPLEMENTED: SEARCH_POST");
}

/* User gets the page to upload a question */
exports.question_create_get = function(req, res, next) {
  res.render('question_upload', {user: req.body.user});
}

/* Processing of a question sent by the user */
exports.question_create_post = function(req, res, next) {
  res.send('NOT IMPLEMENTED: QUESTION_CREATE_POST');
}
