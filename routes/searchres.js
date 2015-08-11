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
                CharsLoaded(res,input,chars);
            }
        });
    };
});

function CharsLoaded(res, search, chars){
    var realCount = 0;
    var utf8 = 0;
    
    for (c of chars){
        console.log(c);
        if (c['Combining Class'] != null && c['Combining Class'] == "0") realCount++;

    }
    res.render('searchres', { 'search': search, 'chars': chars, 'realCount': realCount});
}

function bytesInUtf8(c)
{
    codepoint = c;
    if(codepoint <= 0x7f){
        return 1;
    }
    if(codepoint <= 0x7ff){
        return 2;
    }
    if(codepoint <= 0xffff){
        return 3;
    }
    else{
        return 4;
    }
}

module.exports = router;
