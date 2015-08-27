var express = require('express');
var router = express.Router();
var redis = require('redis');
var redClient = redis.createClient();
var punycode = require('punycode');
var gs = require('../lib/grapheme-splitter.js').graphemeSplitter();
var _ = require('underscore');

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
                charsLoaded(res,input,chars);
            }
        });
    };
});

function charsLoaded(res, search, chars){

    var realCount = gs.countGraphemes(search);
    var toGraph = calculateGraphData(chars);

    res.render('searchres', { 'search': search, 'chars': chars, 'realCount': realCount, 'toGraph': toGraph});
}

function calculateGraphData(chars){
    var size8 = 0;
    var size16 = 0;

    var blocks = _.chain(chars)
        .countBy("Block Name")
        .pairs()
        .sortBy(0)
        .value();
    var ages = _.chain(chars)
        .countBy("Age")
        .pairs()
        .sortBy(0)
        .value();

    for(var i=0;i<chars.length;i++){
        var char = chars[i];
        size8 += bytesInUtf8(char);
        size16 += bytesInUtf16(char);
    }

    var sizes = [["UTF-8",size8],["UTF-16",size16],["UTF-32",chars.length*4]];

    return {blocks:blocks,ages:ages,sizes:sizes};
}

function bytesInUtf8(c)
{
    var codepoint = c["Code Point"];
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

function bytesInUtf16(c)
{
    var codepoint = c["Code Point"];
    if(codepoint <= 0xffff){
        return 2;
    }
    else{
        return 4;
    }
}

module.exports = router;
