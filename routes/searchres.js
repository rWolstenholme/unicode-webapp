var express = require('express');
var router = express.Router();
var redis = require('redis');
var redClient = redis.createClient();

router.get('/search', function(req, res, next) {
    if (!req.query.hasOwnProperty("inp")) {
        var err = new Error('Bad Request');
        err.status = 400;
        return next(err);
    }

    var input = req.query.inp;

    var chars = [];
    for (var x = 0; x < input.length; x++)
    {
        var c =  input.charCodeAt(x).toString(16).toUpperCase();

        if (c.length<4) { c = ("000"+c).slice(-4); }
        console.log(c);
        redClient.get(c,function(err,result){
            chars.push(JSON.parse(result));
            if(chars.length==input.length){
                res.render('searchres', { 'search': input, 'chars': chars });
            }
        });
    };
});

module.exports = router;
