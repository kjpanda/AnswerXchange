var express = require('express');

//Require the controller modules
var answer_controller = require('../controllers/AnswerController.js');
var question_controller = require('../controllers/QuestionController.js');
var user_controller = require('../controllers/UserController.js');

//Function that creates a router base on a given passport
module.exports = function(passport) {
  var router = express.Router();

  /* GET home page. */
  router.get('/', user_controller.user_login_get);

  /* User login */
  router.post('/', passport.authenticate('local-login', {
    successRedirect: '/search',
    failureRedirect: '/',
    failureFlash: true,
  }));

  /* GET signup page */
  router.get('/signup', user_controller.user_create_get);

  /* Post request to create a user account */
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/signup',
    failureFlash: true,
  }));

  /* The user goes to the search page */
  router.get('/search', isLoggedIn, question_controller.search_get);

  /* POST request from the search page */
  router.post('/search', isLoggedIn, question_controller.search_post);

  /* Get the answer for the current question */
  router.get('/question/:id', isLoggedIn, question_controller.question_detail_get);

  /* POST request from a question page, a user has gave an answer */
  router.post('/question/:id', isLoggedIn, answer_controller.answer_create_post);

  /* Get the edit page for the current reply */
  router.get('/answer/:id', isLoggedIn, answer_controller.answer_update_get);

  /* Send the request to edit an answer */
  router.post('/answer/:id', isLoggedIn, answer_controller.answer_update_post);

  /* Get request for the page to upload a question */
  router.get('/question_upload', isLoggedIn, question_controller.question_create_get);

  /* POST request to upload a question */
  router.post('/question_upload', isLoggedIn, question_controller.question_create_post);

  /* Get request to delete a question */
  router.get('/question/:id/delete', isLoggedIn, question_controller.question_delete_get);

  /* Post request to delete a question */
  router.post('/question/:id/delete', isLoggedIn, question_controller.question_delete_post);

  return router
};

//Route a middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
  //If the user is authenticated for the session we will carry on
  if (req.isAuthenticated()) {
    return next();
  }

  //Else, we will redirect it to the login page.
  res.redirect('/');
}
