var express = require('express');

//Require the controller modules
var answer_controller = require('../controllers/AnswerController.js');
var question_controller = require('../controllers/QuestionController.js');
var user_controller = require('../controllers/UserController.js');

var multer  = require('multer');

//MULTER CONFIG: to get file photos to temp server storage
const multerConfig = {
    //specify diskStorage (another option is memory)
    storage: multer.diskStorage({

      //specify destination
      destination: function(req, file, next){
        const ext = file.mimetype.split('/')[1];
        const fileName = file.fieldname + '-' + Date.now() + '.'+ ext;
        const tempPath = process.cwd() + '/public/';
        next(null, tempPath);
      },

      //specify the filename to be unique
      filename: function(req, file, next){
        console.log(file);
        //get the file mimetype ie 'image/jpeg' split and prefer the second value ie'jpeg'
        const ext = file.mimetype.split('/')[1];
        const fileName = file.fieldname + '-' + Date.now() + '.'+ ext;
        req.body.avatarPath = process.cwd() + '/public/' + fileName;
        req.body.mimeType = file.mimetype;
        //set the file fieldname to a unique name containing the original name, current datetime and the extension.
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
      }
    }),
  };

var upload = multer(multerConfig);

//Function that creates a router base on a given passport
module.exports = function(passport) {
  var router = express.Router();

  /* Initial page of the website */
  router.get('/', user_controller.user_explore_get);

  /* Post request for searching of friends */
  router.post('/friend-search', isLoggedIn, user_controller.user_search_post);

  /* Post request to add a friend */
  router.post('/friend-add', isLoggedIn, user_controller.user_add_friend);

  /* Post request to accept or decline a friend */
  router.post('/friend-accept', user_controller.accept_friend);


  /* GET login page. */
  router.get('/login', user_controller.user_login_get);

  /* User login */
  router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true,
  }));

  /* User logout */
  router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });

  /* GET signup page */
  router.get('/signup', user_controller.user_create_get);

  /* Post request to create a user account */
  router.post('/signup', upload.single('avatar'),
      passport.authenticate('local-signup', {
          successRedirect: '/',
          failureRedirect: '/signup',
          failureFlash: true,
      }));

  /*FACEBOOK routes */
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope : ['public_profile', 'email'] //specify the files from facebook we're getting
  }));

  //handle the callback after facebook has authenticated the user
  router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/home',
    failureRedirect : '/login',
  }));
  
  /* GOOGLE routes */
  router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
  
  // the callback after google has authenticated the user
  router.get('/auth/google/callback',
      passport.authenticate('google', {
        successRedirect : '/home',
        failureRedirect : '/login'
      }));

  /* GET home page. */
  router.get('/home', isLoggedIn, user_controller.user_home_get);

  /* Get the page to update the user's detail */
  router.get('/edit/:id', isLoggedIn, user_controller.user_update_get);

  /* Post the user request for the new updates */
  router.post('/edit/:id', [isLoggedIn, upload.single('avatar')]
      , user_controller.user_update_post);

  /* The user goes to the search page */
  router.get('/search', question_controller.search_get);

  /* POST request from the search page */
  router.post('/search', question_controller.search_post);

  /* Get the answer for the current question */
  router.get('/question/:id', question_controller.question_detail_get);

  /* POST request from a question page, a user has gave an answer */
  router.post('/question/:id', isLoggedIn, answer_controller.answer_create_post);

  /* Get the edit page for the current reply */
  router.get('/answer/:id', isLoggedIn, answer_controller.answer_update_get);

  /* Send the request to edit an answer */
  router.post('/answer/:id', isLoggedIn, answer_controller.answer_update_post);

  /* Send the request to delete an answer */
  router.post('/answer/delete/:id', isLoggedIn, answer_controller.answer_delete_post);

  /* Router to upVote for an answer */
  router.post('/answer/:id/vote', isLoggedIn, answer_controller.answer_vote);

  /* Get request for the page to upload a question */
  router.get('/question_upload', isLoggedIn, question_controller.question_create_get);

  /* POST request to upload a question */
  router.post('/question_upload', isLoggedIn, question_controller.question_create_post);

  /* Get request to delete a question */
  router.get('/question/:id/delete', isLoggedIn, question_controller.question_delete_get);

  /* Post request to delete a question */
  router.post('/question/:id/delete', isLoggedIn, question_controller.question_delete_post);

  /* Get request for putting all the friends that a user has */
  router.get('/friends', isLoggedIn, user_controller.user_friends_get);

  return router
};

//Route a middleware to make sure user is logged in
function isLoggedIn(req, res, next) {
  //If the user is authenticated for the session we will carry on
  if (req.isAuthenticated()) {
    return next();
  }

  //Else, we will redirect it to the login page.
  res.redirect('/login');
}
