require('pmx').init();
var express = require('express');
var path = require('path');
var serveStatic = require('serve-static');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var search = require('./routes/searchres')
var idx = require('./routes');
var unicode = require('./routes/unicode')
var about = require('./routes/about')
var charPage = require('./routes/charPage')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// serve up statics
app.use(serveStatic('public/statics'))

app.get('/', idx);
app.get('/search', search)
app.get('/about', about)
app.get('/unicode', unicode)
app.get('/*',charPage)

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.status + " " + err.message,
    error: {}
  });
});


module.exports = app;
