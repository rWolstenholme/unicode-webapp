var express = require('express');
var router = express.Router();
var redis = require('redis');
var redClient = redis.createClient();
var cpf = require('../charpointFormatting.js');

router.get(/^\/[0-9A-F]{4,6}$/, function(req, res, next) {
  var red = req.path.replace('/','/U+')
  res.redirect(red);
});

router.get(/^\/U\+[0-9A-F]{4,6}$/, function(req, res, next) {
  var path = req.path.replace('/U+','');
  redClient.get(path,function(err,result){
    res.render('charPage', { 'char': JSON.parse(result) });
  });
});

router.get(/^\/.$/, function(req, res, next) {
  var ch = req.path.charAt(1);
  var char = cpf.charToDb(ch);
  res.redirect('/'+char);
});


router.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = router;
