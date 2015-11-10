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
    var graphemes = gs.splitGraphemes(input);

    var graphemeLengths =  _.map(graphemes,
        function(grapheme){
            return punycode.ucs2.decode(grapheme).length;
        });

    var chars = [];
    console.log(graphemeLengths);

    for (var x = 0; x < decoded.length; x++)
    {
        var hex =  decoded[x].toString(16).toUpperCase();

        if (hex.length < 4) {
            hex = ("000" + hex).slice(-4);
        }

        redClient.get(hex,function(err,result){
            chars.push(JSON.parse(result));
            if(chars.length==decoded.length){
                charsLoaded(res,input,chars,graphemeLengths);
            }
        });
    };
});

function charsLoaded(res, search, chars, graphemeLengths){
    var codePointCount = chars.length;
    var realCount = graphemeLengths.length;
    var toGraph = calculateGraphData(chars);
    var lessInfo = slimChars(chars);
    var graphemesInserted = insertGraphemes(lessInfo, graphemeLengths);
    console.log(graphemesInserted);

    res.render('searchres', { 'search': search, 'chars': graphemesInserted, 'realCount': realCount, 'toGraph': toGraph, 'codePointCount': codePointCount});
}

function insertGraphemes(lessInfo, graphemeLengths){
    var index = lessInfo.length;
    graphemeLengths = graphemeLengths.reverse();
    graphemeLengths.pop();
    _.each(graphemeLengths, function(len){
        index -= len;
        lessInfo.splice(index,0,'Grapheme Break');
    });
    return lessInfo;
}

function slimChars(chars){
    return _.map(chars,
        function(char){
            return {
                'Character' : char['Character'],
                'Code Point' : char['Code Point'],
                'Name': char['Name'],
                'Block Name': char['Block Name'],
                'Combining Class' : char['Combining Class']
            }
        });
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
