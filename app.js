var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');

var app = express();

var mongoDB = "mongodb://kaijing:s9836223a@ds259119.mlab.com:59119/xchange";

//Connect to the mongoose object
mongoose.connect(mongoDB);
//Use the native built in promise library
mongoose.Promise = global.Promise;
//Get a variable that links to the database
var db = mongoose.connection;
db.on("error", console.error.bind(console, "mongoDB connection error:"));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, limit:'2mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(__dirname + "/public"));
app.use('/uploads', express.static(__dirname + '/uploads'));

//Pass the passport for configuration
require('./config/passport')(passport);
//Set the session
app.use(session({ secret: 'mySecret'}));
app.use(passport.initialize());
app.use(passport.session());  //Allow for persistent login session
app.use(flash());   //Use connect-flash for flash messages

//Handle the routing here
var indexRouter = require('./routes/index')(passport);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
