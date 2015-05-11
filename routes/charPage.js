var express = require('express');
var router = express.Router();
var redis = require('redis');
var redClient = redis.createClient();

router.get(/\/./, function(req, res, next) {
  var char = req.path.charCodeAt(1);
  var inHex = char.toString(16).toUpperCase();
  res.redirect('/'+inHex);
});

router.get('/[0-9A-F]{4}', function(req, res, next) {
  var char = req.path.charCodeAt(1);
  redClient.get(c,function(err,result){
    res.render('charPage', { 'char': c });
  });
});

module.exports = router;
