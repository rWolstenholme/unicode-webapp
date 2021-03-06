var fs = require('fs'),
    xmlStream = require('xml-stream'),
    redis = require('redis'),
    zlib = require('zlib');
var punycode = require('punycode');

var zippedName = 'ucd.all.flat.zip';
var unzippedName = 'ucd.all.flat.xml';
var imPath = "../public/statics/images";
var images = {};

prepareParse();

function prepareFiles(){
    fs.exists(unzippedName,function(err, exists) {
        if (!exists) {
            var gunzip = zlib.createGunzip();
            var inp = fs.createReadStream(zippedName);
            var out = fs.createWriteStream(unzippedName);
            inp.pipe(gunzip)
                .pipe(out)
                .on('end', function () {
                    prepareParse()
                });
        }
        else{
            prepareParse();
        }
    });
}

function prepareParse(){
    console.log("Loading images");
    loadIms("android");
    loadIms("twitter");
    loadIms("windows");
    loadIms("apple");
    var redClient = redis.createClient();
    redClient.on("error", function (err) {
        console.log("Error " + err);
    });
    console.log("Waiting for database connection");
    redClient.on('connect', function() {
        console.log("Connected to database");
        parse(redClient);
    });
}

function parse(redClient){
    var xmlStr = new xmlStream(fs.createReadStream(unzippedName));

    var start = (new Date).getTime();
    var count = 0;

    var chars = [];
    var aliases = [];

    xmlStr.preserve('char', true);
    xmlStr.collect('name-alias');
    xmlStr.on('endElement: char', function(ch){
        var codePoint = ch.$.cp;
        var hasEmoji = images.hasOwnProperty(codePoint);
        var emoji = hasEmoji ? images[codePoint] : [];
        var char = {
            'Character' : punycode.ucs2.encode(["0x"+codePoint]),
            'Code Point' : codePoint,
            'Name' : ch.$.na,
            'Age' : ch.$.age,
            'Block Name' : ch.$.blk,
            'General Catagory' : ch.$.gc,
            'Combining Class' : ch.$.ccc,
            'Decomposition Type' : ch.$.dt,
            'Decomposition Mapping' : ch.$.dm,
            'Grapheme Base' : ch.$.Gr_Base,
            'Grapheme Extended' : ch.$.Gr_Ext,
            'Aliases' : JSON.stringify(aliases),
            'Has Emoji' : hasEmoji,
            'Emoji' : emoji
        };
        chars.push(char);
        aliases = [];
        redClient.set(codePoint, JSON.stringify(char));
        if(count%100==0) console.log("Parsed "+count+" at codepoint "+codePoint);
        count++;
    });
    xmlStr.on('endElement: name-alias', function(na){
        aliases.push({alias:na.$.alias,type:na.$.type});
    });
    xmlStr.on('end',function(){
        console.log("Parsing "+count+" elements complete in: "+(((new Date).getTime()-start))+"ms");
        process.exit(0);
    });
};

function loadIms(type){
    console.log("Loading "+type+" images");
    var arrFiles = fs.readdirSync(imPath+"/"+type);
    arrFiles.forEach(function(im){
        im = im.replace(type+"_",'');
        im = im.replace(".png",'');
        im = im.toUpperCase();
        var components = im.split('_');
        addIm(components,type);
    });
}

function addIm(components,type){
    if(components.length==1) {
        var s = components[0];

        if(!images.hasOwnProperty(s)){
            images[s] = [];
        };

        images[s].push(type);
    }
    else if(components.length>1){

    }
}