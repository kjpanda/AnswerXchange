var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('login', { user:"" });
});

router.get('/search', function(req, res, next) {
  res.render('search', { user:"Darren" })
});


module.exports = router;
