var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { user:"" });
});

router.post('/', function(req, res) {
  res.send('Search function not implemented.');
});

router.get('/search', function(req, res, next) {
  res.render('search', { user:"Darren" });
});

router.post('/search', function(req, res) {
  res.send('Search function not implemented.');
});

module.exports = router;
