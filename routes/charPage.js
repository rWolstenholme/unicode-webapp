var express = require('express');
var router = express.Router();
var redis = require('redis');
var redClient = redis.createClient();
var cpf = require('../charpointFormatting.js');

router.get(/\/[0-9A-F]{4,6}/, function(req, res, next) {
  var path = req.path.replace('/','');
  redClient.get(path,function(err,result){
    res.render('charPage', { 'char': JSON.parse(result) });
  });
});

router.get(/\/./, function(req, res, next) {
  var char = cpf.charToDb(req.path.charAt(1));
  res.redirect('/'+char);
});

module.exports = router;
