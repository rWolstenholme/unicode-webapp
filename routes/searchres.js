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
    console.log(chars);

    for (var x = 0; x < input.length; x++)
    {
        var n =  decoded[x];

        var hex = cpf.decToDb(n);

        console.log(hex);
        redClient.get(hex,function(err,result){
            console.log(err);
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
