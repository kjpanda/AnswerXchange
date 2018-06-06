var express = require('express');
var router = express.Router();

//Require the controller modules
var answer_controller = require('../controllers/AnswerController.js');
var question_controller = require('../controllers/QuestionController.js');
var user_controller = require('../controllers/UserController.js');

/* GET home page. */
router.get('/', user_controller.user_login_get);

/* User login */
router.post('/', user_controller.user_login_post);

/* GET signup page */
router.get('/signup', user_controller.user_create_get);

/* Post request to create a user account */
router.post('/signup', user_controller.user_create_post)

/* The user goes to the search page */
router.get('/search', question_controller.search_get);

/* POST request from the search page */
router.post('/search', question_controller.search_post);

/* Get the answer for the current question */
router.get('/question/:id', question_controller.question_detail_get);

/* POST request from a question page, a user has gave an answer */
router.post('/question/:id', answer_controller.answer_create_post);

/* Get the edit page for the current reply */
router.get('/answer/:id', answer_controller.answer_update_get);

/* Send the request to edit an answer */
router.post('/answer/:id', answer_controller.answer_update_post);

/* Get request for the page to upload a question */
router.get('/question_upload', question_controller.question_create_get);

/* POST request to upload a question */
router.post('/question_upload', question_controller.question_create_post);

/* Get request to delete a question */
router.get('/question/:id/delete', question_controller.question_delete_get);

/* Post request to delete a question */
router.post('/question/:id/delete', question_controller.question_delete_post);

module.exports = router;
