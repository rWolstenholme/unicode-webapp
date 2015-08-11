var express = require('express');
var router = express.Router();
var redis = require('redis');
var redClient = redis.createClient();
var punycode = require('punycode');
var cpf = require('../charpointFormatting.js');

router.get('/search', function(req, res, next) {
    if (!req.query.hasOwnProperty("inp")) {
        var err = new Error('Bad Request');
        err.status = 400;
        return next(err);
    }

    var input = req.query.inp;
    var decoded = punycode.ucs2.decode(input);

    var chars = [];
    console.log(decoded);

    for (var x = 0; x < decoded.length; x++)
    {
        var hex =  decoded[x].toString(16).toUpperCase();
        console.log(hex);

        if (hex.length < 4) {
            hex = ("000" + hex).slice(-4);
        }

        redClient.get(hex,function(err,result){
            console.log(err, result);
            chars.push(JSON.parse(result));
            if(chars.length==decoded.length){
                CharsLoaded(res,input,chars);
            }
        });
    };
});

function CharsLoaded(res, search, chars){
    var realCount = 0;
    var utf8 = 0;

    for (c of chars){
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
