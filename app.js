var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var cookieParser = require("cookie-parser");
var logger = require('morgan');
var mongoose = require('mongoose');
var User = require('./models/User');
var Schema = mongoose.Schema;
var ObjectID = Schema.ObjectID;

var index= require('./routes/index');
var users = require('./routes/users');

//Set up express
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(cookieParser());

app.use('/', index);
app.use('/users', users);

//Set up MongoDB
mongoose.connect('mongodb://localhost/fetch-server')
	.then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
