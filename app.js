var express = require("express");
var bodyParser = require('body-parser');
var app = express();
var helmet = require('helmet');
var httpProxy = require('http-proxy');
// var proxy = httpProxy.createProxyServer({});
var cookieParser = require("cookie-parser");
var compress = require("compression")
var logger = require('morgan');
var mongoose = require('mongoose');
var passport = require("passport");
var Schema = mongoose.Schema;
var ObjectID = Schema.ObjectID;
var config = require('./config/database');

var index= require('./routes/index');
var users = require('./routes/users')(passport);
var pets = require('./routes/pets')(passport);

//Set up MongoDB
mongoose.Promise = global.Promise;
mongoose.connect(config.database)
	.then(() =>  console.log('connection successful'))
  .catch((err) => console.error(err));
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
});
//
// function appProxy(host, port){
// 	return function(req, res, next){
// 		proxy.proxyRequest(req, res, {host:host, port:port});
// 	}
// }
// app.use(appProxy("www.google.com", 80));

//Set up express
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended':'false'}));
app.use(cookieParser());
app.use(compress());
app.use(helmet())
app.use(passport.initialize());
require('./config/passport.js')(passport);

//CORS-ENABLE
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
	res.header("Access-Control-Max-Age", 20);
	next();
});

app.use('/', index);
app.use('/users', users);
app.use('/pets', pets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
	console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
	// res.send(err.message);
	res.json({success:false, msg: err.message})
});

module.exports = app;
