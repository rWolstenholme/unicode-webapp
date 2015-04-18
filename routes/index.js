var express = require('express');
var router = express.Router();


router.get('/search', function(req, res) {
  if (!req.query) return res.sendStatus(400);
  res.render('searchres', { search: req.query.inp });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'unicode-webapp' });
});

module.exports = router;
