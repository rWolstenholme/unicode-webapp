var express = require('express');
var router = express.Router();


router.get('/search', function(req, res, next) {
    if (!req.query.hasOwnProperty("inp")) {
        var err = new Error('Bad Request');
        err.status = 400;
        return next(err);
    }
    res.render('searchres', { search: req.query.inp });
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'unicode-webapp' });
});

module.exports = router;
