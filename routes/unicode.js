var express = require('express');
var router = express.Router();

router.get('/unicode', function(req, res, next) {
    res.render('unicode');
});

module.exports = router;